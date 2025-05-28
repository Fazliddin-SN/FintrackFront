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
      <input id="swal-username" class="swal2-input" placeholder="Username">

      <div style="position: relative; width: 100%; margin-top: .5em">
        <input
          id="swal-password"
          type="password"
          class="swal2-input"
          placeholder="Password"
          style="padding-right: 2.5em"
        >
        <i
          id="swal-toggle-password"
          class="material-icons"
          style="
            position: absolute;
            top: 50%;
            right: 0.75em;
            transform: translateY(-50%);
            cursor: pointer;
          "
        >visibility</i>
      </div>

      <select id="swal-role" class="swal2-select" style="margin-top: 0.5em ; border-radius: 4px;">
        <option value="" disabled selected>Roli tanlang</option>
        ${optionsHtml}
      </select>
    `,
      didOpen: () => {
        const pwField =
          Swal.getPopup().querySelector<HTMLInputElement>("#swal-password")!;
        const toggle = Swal.getPopup().querySelector<HTMLElement>(
          `#swal-toggle-password`
        );

        toggle.addEventListener("click", () => {
          const isHidden = pwField.type === "password";
          pwField.type = isHidden ? "text" : "password";
          toggle.textContent = isHidden ? "visibility_off" : "visibility";
        });
      },
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
          document.getElementById("swal-username") as HTMLInputElement
        ).value.trim();

        const password = (
          document.getElementById("swal-password") as HTMLInputElement
        ).value.trim();

        const roleId = (
          document.getElementById("swal-role") as HTMLInputElement
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

    Swal.fire<{
      username: string;
      password: string;
      roleId: string;
    }>({
      title: "Yangi foydalanuvchi qo'shish!",
      html: `
      <input id="swal-username" value="${user.username}" class="swal2-input" placeholder="Username">

      <div style="position: relative; width: 100%; margin-top: .5em">
        <input
          id="swal-password"
          type="password"
          class="swal2-input"
          placeholder="Password"
          style="padding-right: 2.5em"
        >
        <i
          id="swal-toggle-password"
          class="material-icons"
          style="
            position: absolute;
            top: 50%;
            right: 0.75em;
            transform: translateY(-50%);
            cursor: pointer;
          "
        >visibility</i>
      </div>

      <select id="swal-role" class="swal2-select" style="margin-top: 0.5em ; border-radius: 4px;">
        <option value="" disabled selected>Roli tanlang</option>
        ${optionsHtml}
      </select>
    `,
      didOpen: () => {
        const pwField =
          Swal.getPopup().querySelector<HTMLInputElement>("#swal-password")!;
        const toggle = Swal.getPopup().querySelector<HTMLElement>(
          `#swal-toggle-password`
        );

        toggle.addEventListener("click", () => {
          const isHidden = pwField.type === "password";
          pwField.type = isHidden ? "text" : "password";
          toggle.textContent = isHidden ? "visibility_off" : "visibility";
        });
      },
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
          document.getElementById("swal-username") as HTMLInputElement
        ).value.trim();

        const password = (
          document.getElementById("swal-password") as HTMLInputElement
        ).value.trim();

        const roleId = (
          document.getElementById("swal-role") as HTMLInputElement
        ).value.trim();

        if (!username || !password || !roleId) {
          Swal.showValidationMessage(
            "Iltimos, username, password va ro‘lni tanlang"
          );
          return;
        } // Directly start your HTTP call—no Swal.showLoading()
        this.authService
          .updateUser(user.id, username, password, +roleId)
          .subscribe({
            next: (res) => {
              // console.log("res ", res);
              // Show the success toast
              Swal.fire(
                "Muvaffaqiyat!",
                "Foydalanuvchi malumotlari tahrirlandi." + res,
                "success"
              );
              this.loadUsers();
            },
            error: (err) => {
              Swal.fire("Xatolik", err.error?.error || err.message, "error");
            },
          });
        return { username, password, roleId };
      },
    });
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
