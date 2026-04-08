import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {SvgIcon} from '../../shared/components/svg-icon/svg-icon';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../core/auth/auth.service';
import {Router} from '@angular/router';
import {catchError, EMPTY, from, switchMap} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    SvgIcon,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl<string>('', {nonNullable: true, validators:[Validators.email, Validators.required]}),
    password: new FormControl<string>('', {nonNullable: true, validators: Validators.required}),
  });

  onSubmit() {
    if (this.form.valid) {
      this.authService.login(this.form.getRawValue()).pipe(
        switchMap(() => from(this.router.navigate(['/']))),
        catchError((err) => {
          if (err?.status === 401 || err?.status === 403) {
            console.error('Неверный логин или пароль!')

            // this.toastr.error('Неверный логин или пароль.');
          } else {
            console.error('Ошибка сервера. Попробуйте позже.')

            // this.toastr.error('Ошибка сервера. Попробуйте позже.');
          }
          return EMPTY;
        })
      ).subscribe();
    }
  }
}
