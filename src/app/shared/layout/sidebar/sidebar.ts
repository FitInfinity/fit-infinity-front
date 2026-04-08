import {Component, inject, OnInit, signal} from '@angular/core';
import {SvgIcon} from '../../components/svg-icon/svg-icon';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ProfileService} from '../../services/profile.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    SvgIcon,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  profileService = inject(ProfileService);
  profile = this.profileService.profile;

  isCollapsed = signal(false);

  navLinks = [
    {
      label: 'Главная',
      icon: 'dashboard',
      to: '/dashboard',
    },
    {
      label: 'Расписание',
      icon: 'schedule',
      to: '/schedule',
    },
    {
      label: 'Тренировки',
      icon: 'clock',
      to: '/workout-session',
    },
    {
      label: 'Программы',
      icon: 'list',
      to: '/workout-program',
    },
    {
      label: 'Упражнения',
      icon: 'sport-shoe',
      to: '/workout-exercise',
    },
    {
      label: 'Статистика',
      icon: 'statistics',
      to: '/statistics',
    },
  ]

  ngOnInit() {
    this.profileService.getMe().subscribe();
  }

  toggle() {
    this.isCollapsed.update(v => !v);
  }
}
