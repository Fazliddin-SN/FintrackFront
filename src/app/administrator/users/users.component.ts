import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { GlobalEnvService } from "src/app/globalenv.service";
import { AuthService } from "src/app/services/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
})
export class UsersComponent implements OnInit {
  usersList: string[] = [];
  errorMessage: string;
  roles: any[] = [];
  constructor(
    private authService: AuthService,
    private config: GlobalEnvService
  ) {
    this.loadUsers();
    this.roles = this.config.roles;
  }

  ngOnInit(): void {
    this.loadUsers();
    this.config.loadRoles().subscribe({
      next: (res) => (this.roles = res),
    });
  }

  // fetching user data
  loadUsers() {
    return this.authService.loadUsers().subscribe({
      next: (res) => {
        this.usersList = res;
      },
      error: (err) => {
        this.errorMessage = err.error.error;
      },
    });
  }

  // registe new user
  async registerUser() {
    const optionsHtml = this.roles
      .map((r) => `<option value="${r.id}">${r.role_name}</option>`)
      .join("");
    const result = await Swal.fire<{
      username: string;
      password: string;
      roleId: string;
    }>({
      title: "Yangi foydalanuvchi qo'shish!",
      html: `
      <div class="form-group">
      <input id="username" type="text" class="form-control m-2" placeholder="Username..." />
      <input id="password" type="password" class="form-control m-2" placeholder="Password..." />
      <select id="staffId" class="form-control m-2" >
        <option value="" disabled selected>Xodimlardan birini tanlang</option>
        ${optionsHtml}
        </select>
      </div>
    `,

      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",

      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-info",
      },
      buttonsStyling: false,

      preConfirm: () => {
        const username = (
          document.getElementById("username") as HTMLInputElement
        ).value.trim();

        const password = (
          document.getElementById("password") as HTMLInputElement
        ).value.trim();

        const roleId = (
          document.getElementById("staffId") as HTMLInputElement
        ).value.trim();

        if (!username || !password || !roleId) {
          Swal.showValidationMessage(
            "Iltimos, username, password va ro‘lni tanlang"
          );
          return;
        }
        return { username, password, roleId };
      },
    });

    // If the user clicked “Saqlash” with valid inputs…
    if (result.isConfirmed && result.value) {
      const { username, password, roleId } = result.value;

      try {
        Swal.showLoading();
        // replace .register(...) signature with your actual service call
        await firstValueFrom(
          this.authService.register(username, password, roleId)
        );

        this.loadUsers();
        Swal.fire("Muvaffaqiyat!", "Yangi foydalanuvchi qo‘shildi.", "success");
      } catch (err: any) {
        Swal.fire("Xatolik", err.error?.error || err.message, "error");
      }
    }
  }

  // registe new user
  async editUser(user: any) {
    // assume `user.roleId` is the numeric ID, and `this.roles: Role[]` is your list
    const optionsHtml = this.roles
      .map(
        (r) => `
       <option value="${r.id}" ${r.id === user.role_id ? "selected" : ""}>
    ${r.role_name}</option>`
      )
      .join("");

    const result = await Swal.fire({
      title: "Foydalanuvchi malumotlarini tahrirlash!!",
      html: `
        <div class="form-group">
        <div style="display: flex; align-items: center" class="m-2">
          <label for="input-card" style="width: 180px">Username</label>
          <input
            id="username"
            type="text"
            value="${user.username}"
            class="form-control"
            placeholder="Username..."
          />
        </div>

        <div style="display: flex; align-items: center" class="m-2">
          <label for="input-card" style="width: 180px">Password</label>
          <input
            id="password"
            type="password"
            class="form-control"
            placeholder="Password..."
          />
        </div>

        <div style="display: flex; align-items: center" class="m-3">
          <label for="role_id" style="width: 180px">Xodim Rolini tanlang</label>
          <select id="role_id" class="form-control">
            <option value="" disabled selected>Xodim Roli</option>
            ${optionsHtml}
          </select>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Saqlash",
      cancelButtonText: "Bekor Qilish",
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,

      preConfirm: () => {
        let username = $("#username").val();
        let password = $("#password").val();
        let role_id = Number($("#role_id").val());

        return {
          username,
          password,
          role_id,
        };
      },
    });
    if (result.isConfirmed && result.value) {
      // console.log("result value ", result.value);
      if (
        !result.value.password ||
        !result.value.role_id ||
        !result.value.username
      ) {
        Swal.fire(
          "Xatolik",
          "Role tanlanishi va username va password kiritilishi kerak!",
          "error"
        );
        return;
      }
      this.authService.updateUser(user.id, result.value).subscribe({
        next: (res) => {
          Swal.fire(
            "Muvaffaqiyat!",
            "Foydalanuvchi malumotlari tahrirlandi!.",
            "success"
          );
          this.loadUsers();
        },
        error: (err) => {
          Swal.fire("Xatolik", err.error?.error || err.message, "error");
        },
      });
    }
  }

  // DELETE USER
  // deleting the income
  delete(id: string) {
    Swal.fire({
      title: "O'chirish Amaliyoti uchub parol kiriting",
      allowEnterKey: true,
      input: "text",
      confirmButtonText: "Kiritish",
      customClass: {
        confirmButton: "btn btn-success",
      },
      buttonsStyling: false,

      preConfirm: (valueB) => {
        if (valueB == "2") {
          Swal.fire({
            icon: "question",
            title:
              "Rostan ham bu Foydalanuvchi malumotlarini o'chirmoqchimisiz",
            showCancelButton: true,
            confirmButtonText: "Ha, O'chirish",
            cancelButtonText: "Bekor qilish",
          }).then((result) => {
            if (result.isConfirmed) {
              this.authService.deleteUserData(+id).subscribe({
                next: () => {
                  Swal.fire(
                    "Muvaffaqiyat",
                    "Foydalanuvchi malumotlari o'chirildi!",
                    "success"
                  );
                  this.loadUsers();
                },
                error: (err) => {
                  Swal.fire("Xatolik", err.error.error, "error");
                },
              });
            }
          });
        } else {
          Swal.fire("Parol Notogri!", "Boshqattan parol kiriting!", "error");
          return;
        }
      },
    });
  }

  userRole(roleId: string) {
    return this.roles.find((r) => r.id === roleId)?.role_name;
  }
}
