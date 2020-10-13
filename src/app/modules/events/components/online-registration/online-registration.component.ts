import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { ConfirmDialog } from '../../../shared/components';
import { IconToastComponent } from '../../../shared/components/icon-toast.component';

@Component({
  selector: 'app-online-registration',
  templateUrl: './online-registration.component.html',
  styleUrls: ['./online-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineRegistrationComponent implements OnChanges {
  @Input() event: any;
  public canSignUp$: Observable<any>;
  constructor(
    private fireFunctions: AngularFireFunctions,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    this.canSignUp$ = of(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.event) {
      this.canSignUp$ = this.auth.user$.pipe(
        switchMap((user) =>
          this.event.registrations.pipe(
            map(
              (registrations: any[]) =>
                !registrations.find(
                  (registration) => registration.id === user.id
                )
            )
          )
        )
      );
    }
  }

  async register(): Promise<void> {
    const snack = this.snackBar.openFromComponent(IconToastComponent, {
      data: {
        message: `Please wait while we're signing you up`,
        icon: 'icon-spinner-frame-1',
      },
      duration: 0,
    });
    await this.fireFunctions
      .httpsCallable<{ eventId: string; type: 'tutor' | 'student' }, any>(
        'registerForEvent'
      )({
        eventId: this.event.id,
        type: 'student',
      })
      .toPromise();
    snack.dismiss();
  }
}
