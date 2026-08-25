import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from "app/shared/shared.module";

import { MatchHeightModule } from 'app/shared/directives/match-height.directive';

import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { LandPageRoutingModule } from "./land-page-routing.module";
import { LandPageComponent } from "./land/land-page.component";

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import { PipeModule } from 'app/shared/pipes/pipe.module';

import {DndDirective} from "app/shared/directives/dnd.directive";

@NgModule({
    exports: [
        TranslatePipe,
        TranslateDirective
    ],
    imports: [
        CommonModule,
        LandPageRoutingModule,
        FormsModule,
        NgbModule,
        MatchHeightModule,
        TranslatePipe,
        TranslateDirective,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatRadioModule,
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        SharedModule,
        PipeModule
    ],
    declarations: [
        LandPageComponent,
        DndDirective
    ]
})
export class LandPageModule { }
