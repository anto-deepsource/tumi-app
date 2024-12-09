import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  DeregisterFromEventGQL,
  LoadEventQuery,
  RegisterForEventGQL,
} from '@tumi/data-access';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'tumi-online-event-registration',
  templateUrl: './online-event-registration.component.html',
  styleUrls: ['./online-event-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineEventRegistrationComponent {
  @Input() public event: LoadEventQuery['event'] | null = null;
  public processing = new BehaviorSubject(false);
  constructor(
    private registerForEvent: RegisterForEventGQL,
    private deregistrationMutation: DeregisterFromEventGQL,
    private snackBar: MatSnackBar,
  ) {}

  get lastDeregistration() {
    return DateTime.fromISO(this.event?.start ?? new Date())
      .minus({ days: 3 })
      .toJSDate();
  }

  get canDeregister() {
    return this.lastDeregistration > new Date();
  }

  public async register() {
    this.processing.next(true);
    try {
      await firstValueFrom(
        this.registerForEvent.mutate({ eventId: this.event?.id ?? '' }),
      );
    } catch (e) {
      this.processing.next(false);
      if (e instanceof Error) {
        this.snackBar.open(`❗ There was an error: ${e.message}`);
      }
      return;
    }
    this.processing.next(false);
  }

  async deregister() {
    this.processing.next(true);
    try {
      await firstValueFrom(
        this.deregistrationMutation.mutate({
          registrationId: this.event?.activeRegistration?.id ?? '',
        }),
      );
    } catch (e: unknown) {
      this.processing.next(false);
      if (e instanceof Error) {
        this.snackBar.open(`❗ There was an error: ${e.message}`);
      }
      return;
    }
    this.snackBar.open('✔️ Success');
    this.processing.next(false);
  }
}
