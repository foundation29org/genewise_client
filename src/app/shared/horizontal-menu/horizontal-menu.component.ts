import { Component, OnInit, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { HROUTES } from './navigation-routes.config';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss'],
  standalone: false
})
export class HorizontalMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  public menuItems: any[];
  public config: any = {};
  level: number = 0;
  transparentBGClass = "";
  menuPosition = 'Side';

  layoutSub: Subscription;

  constructor(private configService: ConfigService) {
    this.config = this.configService.templateConf();
    effect(() => {
      this.config = this.configService.templateConf();
      this.loadLayout();
    });
  }

  ngOnInit() {
    this.menuItems = HROUTES;
  }

  ngAfterViewInit() {
  }

  loadLayout() {

    if (this.config.layout.menuPosition && this.config.layout.menuPosition.toString().trim() != "") {
      this.menuPosition = this.config.layout.menuPosition;
    }


    if (this.config.layout.variant === "Transparent") {
      this.transparentBGClass = this.config.layout.sidebar.backgroundColor;
    }
    else {
      this.transparentBGClass = "";
    }

  }

  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
  }

}
