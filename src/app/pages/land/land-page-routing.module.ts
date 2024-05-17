import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandPageComponent } from "./land/land-page.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '.',
        component: LandPageComponent,
        data: {
          title: 'GeneWise'
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandPageRoutingModule { }
