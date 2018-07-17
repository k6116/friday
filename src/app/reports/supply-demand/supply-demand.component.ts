import { Component, OnInit } from '@angular/core';
import { ApiDataEmployeeService, ApiDataProjectService, ApiDataPermissionService,
  ApiDataMetaDataService, ApiDataEmailService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';

import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';

@Component({
  selector: 'app-supply-demand',
  templateUrl: './supply-demand.component.html',
  styleUrls: ['./supply-demand.component.css', '../../_shared/styles/common.css']
})
export class SupplyDemandComponent implements OnInit {

  projectList: any;
  completerProjectList: any;


  protected searchStr: string;
  protected captain: string;
  protected dataService: CompleterData;
  protected searchData = [
    { color: 'red', value: '#f00' },
    { color: 'green', value: '#0f0' },
    { color: 'blue', value: '#00f' },
    { color: 'cyan', value: '#0ff' },
    { color: 'magenta', value: '#f0f' },
    { color: 'yellow', value: '#ff0' },
    { color: 'black', value: '#000' }
  ];
  protected captains = ['James T. Kirk', 'Benjamin Sisko', 'Jean-Luc Picard',
  'Spock', 'Jonathan Archer', 'Hikaru Sulu', 'Christopher Pike', 'Rachel Garrett' ];


  constructor(
    private apiDataEmployeeService: ApiDataEmployeeService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataPermissionService: ApiDataPermissionService,
    private apiDataMetaDataService: ApiDataMetaDataService,
    private apiDataEmailService: ApiDataEmailService,
    private cacheService: CacheService,
    private authService: AuthService,
    private completerService: CompleterService
  ) {
    this.dataService = completerService.local(this.searchData, 'color', 'color');
   }

  ngOnInit() {
    this.getUserProjectList();
  }

  getUserProjectList() {
    this.apiDataProjectService.getProjectsFilterProjectType()
    .subscribe(
      res => {
        this.projectList = res;
        this.completerProjectList = this.completerService.local(res, 'ProjectProjectType', 'ProjectProjectType');
        console.log('Project List: ', this.projectList);
      },
      err => {
        console.log(err);
      }
    );
  }

  selectProjectClick(project: CompleterItem) {
    console.log(project.title)
  }

}
