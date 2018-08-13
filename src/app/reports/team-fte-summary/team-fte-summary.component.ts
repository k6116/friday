import { Component, OnInit, OnDestroy, EventEmitter, HostListener } from '@angular/core';
import { ApiDataOrgService, ApiDataReportService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
import { CacheService } from '../../_shared/services/cache.service';
import { Subscription } from 'rxjs/Subscription';

import * as Highcharts from 'highcharts';

declare var require: any;
declare const $: any;
const moment = require('moment');
require('highcharts/modules/pareto.js')(Highcharts);

@Component({
  selector: 'app-team-fte-summary',
  templateUrl: './team-fte-summary.component.html',
  styleUrls: ['./team-fte-summary.component.css', '../../_shared/styles/common.css']
})
export class TeamFteSummaryComponent implements OnInit, OnDestroy {

  loggedInUserEmail: any;
  orgDropdownViewPermissions: any;

  userIsManager: boolean; // store if the user is a manager (has subordinates) or not
  userIsManagerSubscription: Subscription;  // for fetching subordinate info
  managerEmail: string;

  chartIsLoading = true;  // display boolean for "Loading" spinner
  paretoChart: any; // chart obj
  paretoChartOptions: any;  // chart options
  paretoChartSubscription: Subscription;  // for subordinates roster under a given project

  teamSummaryData: any; // for teamwide FTE summary data
  displaySelectedProjectRoster = false;
  selectedProject: string;
  selectedProjectRoster: any;
  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];


  nestedOrgData: any;
  flatOrgData: any;
  subscription1: Subscription;
  waitingForOrgData: boolean;
  displayOrgDropDown: boolean;
  displayedEmployee: any;
  displayResults: boolean;
  employeeElements: any;
  dropDownDisplayedEmployee: string;
  quarterlyEmployeeFTETotals: any;
  currentFiscalQuarter: number;
  currentFiscalYear: number;



  constructor(
    private apiDataOrgService: ApiDataOrgService,
    private apiDataReportService: ApiDataReportService,
    private authService: AuthService,
    private cacheService: CacheService
  ) {
    this.displayOrgDropDown = false;
    this.dropDownDisplayedEmployee = 'Loading...';
  }

  ngOnInit() {

    this.loggedInUserEmail = this.authService.loggedInUser.email;
    // Shameless hardcoding permissions to use the "View As" dropdown feature
    this.orgDropdownViewPermissions = ['paul_sung@keysight.com', 'bill_schuetzle@keysight.com',
                                       'tawanchai.schmitz@keysight.com', 'bryan.cheung@keysight.com',
                                       'mike.galasso@non.keysight.com'];

    // find out if user is a manager and store it for future display use
    this.userIsManagerSubscription = this.apiDataOrgService.getOrgData(this.loggedInUserEmail).subscribe( res => {
      // parse the json response. we only want the top level user, so use only the first index
      const userOrgData = JSON.parse('[' + res[0].json + ']')[0];
      this.userIsManager = userOrgData.numEmployees > 0 ? true : false;
      if (this.userIsManager) {
        this.managerEmail = this.authService.loggedInUser.email;
      } else {
        this.managerEmail = userOrgData.supervisorEmailAddress;
      }
      // then initialize the data for the report
      this.componentDataInit('current-quarter');
    });

    if (this.cacheService.$nestedOrgData) {
      this.nestedOrgData = this.cacheService.$nestedOrgData;
      this.cacheService.nestedOrgDataCached = true;
      this.waitingForOrgData = false;
      this.setInitialDropDownEmployee();
      this.cacheService.nestedOrgDataRequested = undefined;
    }

    this.subscription1 = this.cacheService.nestedOrgData.subscribe(
      (nestedOrgData: any) => {
        if (!this.cacheService.nestedOrgDataCached) {
          this.nestedOrgData = nestedOrgData;
          this.cacheService.$nestedOrgData = nestedOrgData;
          this.cacheService.nestedOrgDataCached = true;
          this.waitingForOrgData = false;
          this.setInitialDropDownEmployee();
          this.cacheService.nestedOrgDataRequested = undefined;
        }
    });

    if (!this.cacheService.nestedOrgDataRequested && !this.cacheService.nestedOrgDataCached) {
      // this.getNestedOrgData('ron_nersesian@keysight.com');
      this.getNestedOrgData(this.authService.loggedInUser.email);
    }

    // show the spinner if the nested org data is not loaded yet
    if (!this.nestedOrgData) {
      this.waitingForOrgData = true;
    }

  }

  ngOnDestroy() {
    // clean up the subscriptions
    if (this.userIsManagerSubscription) {
      this.userIsManagerSubscription.unsubscribe();
    }
    if (this.paretoChartSubscription) {
      this.paretoChartSubscription.unsubscribe();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }

    this.subscription1.unsubscribe();

  }


  componentDataInit(period: string) {

    this.displaySelectedProjectRoster = false;
    this.chartIsLoading = true;

    this.getTeamFtePareto(this.managerEmail, period);

  }


  getTeamFtePareto(email: string, period: string) {
    // get nested project pareto with list of team members and their FTEs underneath each project
    this.paretoChartSubscription = this.apiDataReportService.getSubordinateProjectRoster(email, period)
    .subscribe( res => {
      this.teamSummaryData = res;
      // total up the number of FTEs contributed to each project
      let teamwideTotal = 0;
      this.teamSummaryData.forEach( project => {
        project.teamMembers.forEach( employee => {
          project.totalFtes += employee.fte;
          teamwideTotal += employee.fte;
        });
      });
      // convert each project's total FTEs to a percentage of the teamwide FTEs
      this.teamSummaryData.forEach( project => {
        project.teamwidePercents = 100 * project.totalFtes / teamwideTotal;
      });
      console.log(this.teamSummaryData);
      this.plotFteSummaryPareto(period);
      this.chartIsLoading = false;
    });
  }


  plotFteSummaryPareto(period: string) {
    // get the requested time period string's index
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    // sort the projects by highest total team FTEs
    this.teamSummaryData.sort( (a, b) => {
      return b.totalFtes - a.totalFtes;
    });

    // translate data from nested obj into flat arrays for highcharts pareto plotting
    const projectNames = [];
    const projectFTEs = [];
    const teamwidePercents = [];
    this.teamSummaryData.forEach( project => {
      projectFTEs.push({
        name: project.projectName,
        projectID: project.projectID,
        y: project.totalFtes
      });
      projectNames.push(project.projectName);
      teamwidePercents.push(project.teamwidePercents);
    });

    this.paretoChartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      chart: {
        height: 500
      },
      title: {
        text: `My Team's Projects`
      },
      subtitle: {
        text: `Time Period: ${timePeriod.text}`
      },
      xAxis: {
        categories: projectNames
      },
      yAxis: [
        { // primary y-axis
          title: {text: 'FTEs per month'}
        },
          { // secondary y-axis
          title: {text: 'Percent of Team'},
          labels: {format: '{value}%'},
          min: 0,
          max: 100,
          opposite: true
        }
      ],
      tooltip: {
        shared: true
      },
      series: [
        {
          name: 'Total Team FTEs per month',
          type: 'column',
          data: projectFTEs,
          tooltip: {
            pointFormat: `{series.name}: <b>{point.y:.1f}</b><br />`
          },
          point: {
            events: {
              click: function(e) {  // function if user clicks a point to display team members on selected project
                const p = e.point;
                this.displaySelectedProjectRoster = false;
                this.showSubordinateTeamRoster(p.projectID);
              }.bind(this)
            }
          }
        },
        {
          name: 'Percent of Team',
          type: 'spline',
          zIndex: 2,
          yAxis: 1,  // use secondary y-axis for the spline plot
          data: teamwidePercents,
          tooltip: {
            pointFormat: `{series.name}: <b>{point.y:.1f}%</b>`
          }
        }
      ]
    };
    this.paretoChart = Highcharts.chart('pareto', this.paretoChartOptions);
  }

  showSubordinateTeamRoster(projectID: number) {
    this.teamSummaryData.forEach( project => {
      // find the project that was clicked and store into selectedProject vars for display
      if (project.projectID === projectID) {
        this.selectedProject = project.projectName;
        this.selectedProjectRoster = project.teamMembers;
      }
    });
    this.displaySelectedProjectRoster = true;
  }

  // Org Dropdown Start

  getNestedOrgData(email: string) {
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        console.log('nested org object retrieved from api data service in employee reports component');
        console.log(nestedOrgData);
        this.nestedOrgData = nestedOrgData;
        this.waitingForOrgData = false;
        this.cacheService.$nestedOrgData = this.nestedOrgData;
        this.cacheService.nestedOrgDataCached = true;
        this.setInitialDropDownEmployee();
        const t0 = performance.now();
        this.flatOrgData = this.flattenNestedOrgData($.extend(true, {}, this.nestedOrgData));
        const t1 = performance.now();
        // console.log(`flatten org data took ${t1 - t0} milliseconds`);
        // console.log('flattened org data');
        // console.log(this.flatOrgData);
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }


  getDropDownStyle(): any {
    if (this.waitingForOrgData) {
      return {'background-color': 'rgb(245, 245, 245)', cursor: 'wait'};
    } else {
      return {'background-color': 'rgb(255, 255, 255)'};
    }
  }


  setInitialDropDownEmployee() {
    this.dropDownDisplayedEmployee = this.nestedOrgData[0].fullName;
    this.displayedEmployee = this.nestedOrgData[0];
  }


  onOrgDropDownClick() {
    if (!this.waitingForOrgData) {
      if (!this.displayOrgDropDown) {
        if (this.nestedOrgData[0].numEmployees > 0) {
          this.nestedOrgData[0].showEmployees = true;
        }
        this.displayOrgDropDown = true;
        setTimeout(() => {
          this.employeeElements = $('div.emp-name');
        }, 0);
      } else {
        this.displayOrgDropDown = false;
        this.collapseOrg(this.nestedOrgData);
      }
    }
  }


  onclickedEmployeeIcon(employee) {
    this.expandCollapseOrg(this.nestedOrgData, employee.fullName, true);
  }


  expandCollapseOrg(org: any, name: string, animate?: boolean) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        if (org[i].fullName === name) {
          if (animate) {
            if (!org[i].showEmployees) {
              org[i].showEmployees = !org[i].showEmployees;
              this.setEmployeeElements();
              // this.setIndent();
              this.animateExpandCollapse(org[i], true);
            } else {
              this.animateExpandCollapse(org[i], false);
              setTimeout(() => {
                org[i].showEmployees = !org[i].showEmployees;
                this.setEmployeeElements();
                // this.setIndent();
              }, 500);
            }
          } else {
            org[i].showEmployees = !org[i].showEmployees;
            this.setEmployeeElements();
            // this.setIndent();
          }
          return;
        } else if (org[i].employees) {
          this.expandCollapseOrg(org[i].employees, name, animate);
        }
      }
    }

  }


  setEmployeeElements() {
    setTimeout(() => {
      this.employeeElements = $('div.emp-name');
    }, 0);
  }


  animateExpandCollapse(employee: any, expand: boolean) {

    const $el = $(`div.team-cont.${employee.uid}`);
    if (expand) {
      $el.css(
        {
          'max-height': '0',
          // '-webkit-transition': 'max-height 0.35s ease-out',
          // '-moz-transition': 'max-height 0.35s ease-out',
          // '-o-transition': 'max-height 0.35s ease-out',
          'transition': 'max-height 0.35s ease-out'
        }
      );
      setTimeout(() => {
        $el.css('max-height', `${32 * employee.numEmployees}px`);
      }, 0);
      setTimeout(() => {
        $el.css({'max-height': '', 'transition': ''});
      }, 500);
    } else {
      $el.css(
        {
          'max-height': `${32 * employee.numEmployees}px`,
          // '-webkit-transition': 'max-height 0.35s ease-in',
          // '-moz-transition': 'max-height 0.35s ease-in',
          // '-o-transition': 'max-height 0.35s ease-in',
          'transition': 'max-height 0.35s ease-in'
        }
      );
      setTimeout(() => {
        $el.css('max-height', '0');
      }, 0);
      setTimeout(() => {
        $el.css({'max-height': '', 'transition': ''});
      }, 500);
    }

  }


  // collapse all managers - set showEmployees to false
  collapseOrg(org: any) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        org[i].showEmployees = false;
        if (org[i].employees) {
          this.collapseOrg(org[i].employees);
        }
      }
    }

  }


  @HostListener('scroll', ['$event'])
  onScroll(event) {
    this.setIndent();
  }


  setIndent() {
    const displayedLevels: number[] = [];
    this.employeeElements.each((i, obj) => {
      const dataUID = obj.getAttribute('data-uid');
      const element = `div.emp-name[data-uid=${dataUID}]`;
      if (this.checkInView(element, false)) {
        displayedLevels.push($(element).data('level'));
      }
    });
    const rootLevel = this.nestedOrgData[0].level;
    const minLevel = Math.min(...displayedLevels);
    const indent = minLevel - rootLevel - 1 >= 1 ? minLevel - rootLevel - 1 : 0;
    $('div.org-dropdown-cont-inner').css('left', -(1 + (indent * 15)));
    // const container = $('div.org-dropdown-cont');
    // container.scrollLeft(indent * 15);
    // container.animate({scrollLeft: indent * 15}, 100);
  }


  checkInView(elem, partial): boolean {
    const container = $('div.org-dropdown-cont');
    const contHeight = container.height();
    const contTop = container.scrollTop();
    const contBottom = contTop + contHeight ;

    if (!$(elem).offset()) {
      console.error('cant find element');
      return false;
    }

    const elemTop = $(elem).offset().top - container.offset().top;
    const elemBottom = elemTop + $(elem).height();

    const isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    const isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial;

    return isTotal || isPart;
  }


  onClickOutside(clickedElement) {
    this.displayOrgDropDown = false;
  }


  flattenNestedOrgData(org: any): any {

    const flatOrgData: any[] = [];
    flattenOrgData(org);

    function flattenOrgData(org2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          const employee = $.extend(true, {}, org2[i]);
          if (employee.hasOwnProperty('employees')) {
            delete employee.employees;
          }
          flatOrgData.push(employee);
          if (org2[i].employees) {
            flattenOrgData(org2[i].employees);
          }
        }
      }
    }

    return flatOrgData;

  }


  getManager(org: any, employee: any): any {

    let manager: any;
    findManager(org, employee);

    function findManager(org2: any, employee2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].personID === employee2.supervisorID) {
            manager = org2[i];
            return;
          }
          if (org2[i].employees) {
            findManager(org2[i].employees, employee2);
          }
        }
      }
    }

    return manager;

  }


  getEmployees(org: any, employee: any): any {

    const employees: any[] = [];
    findEmployees(org, employee);

    function findEmployees(org2: any, employee2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].personID === employee2.personID) {
            if (org2[i].hasOwnProperty('employees')) {
              org2[i].employees.forEach(employee3 => {
                const empCopy = $.extend(true, {}, employee3);
                if (empCopy.hasOwnProperty('employees')) {
                  delete empCopy.employees;
                }
                employees.push(empCopy);
              });
            }
            return;
          }
          if (org2[i].employees) {
            findEmployees(org2[i].employees, employee2);
          }
        }
      }
    }

    return employees;

  }

  onclickedEmployee(employee) {
    console.log('Employee', employee);
    this.managerEmail = employee.emailAddress;
    this.componentDataInit('current-quarter');
  }

}
