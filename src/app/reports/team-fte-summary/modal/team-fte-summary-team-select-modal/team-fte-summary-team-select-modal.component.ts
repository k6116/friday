import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
// import { Subscription } from 'rxjs/Subscription';

declare var $: any;


@Component({
  selector: 'app-team-fte-summary-team-select-modal',
  templateUrl: './team-fte-summary-team-select-modal.component.html',
  styleUrls: ['./team-fte-summary-team-select-modal.component.css', '../../../../_shared/styles/common.css']
})
export class TeamFteSummaryTeamSelectModalComponent implements OnInit, OnDestroy {

  @Input() nestedOrgData: any;
  @Output() close = new EventEmitter<boolean>();
  @Output() selectedManager = new EventEmitter<any>();
  @Output() checkAllTeams = new EventEmitter<any>();

  // nestedOrgData2: any;
  // nestedOrgData: any;
  // flatOrgData: any;
  // subscription1: Subscription;
  waitingForOrgData: boolean;
  displayOrgDropDown: boolean;
  displayedEmployee: any;
  displayResults: boolean;
  employeeElements: any;
  dropDownDisplayedEmployee: string;
  // quarterlyEmployeeFTETotals: any;
  // currentFiscalQuarter: number;
  // currentFiscalYear: number;

  selectedEmployee: any;

  checkAggregateAllTeams: boolean;
  // temp properties for testing
  // manager: any;
  // managerString: string;
  // employees: any;
  // employeesString: string;
  // teamMembers: any;
  // teamMembersString: string;


  @HostListener('scroll', ['$event'])
  onScroll(event) {
    this.setIndent();
  }

  constructor() { }

  ngOnInit() {
    // console.log('team select modal component initialized');
    // console.log('nested org data structure in modal:');
    // console.log(this.nestedOrgData);

    this.waitingForOrgData = false;
    // this.setInitialDropDownEmployee();
    
    this.checkAggregateAllTeams = false;
  }

  ngOnDestroy() {
    // console.log('team select modal component destroyed');
  }

  testViewChild() {
    // console.log('hello! view child works!');
  }

  setInitialDropDownEmployee(employee: any) {
    // this.dropDownDisplayedEmployee = this.nestedOrgData[0].fullName;
    // this.displayedEmployee = this.nestedOrgData[0];
    // this.selectedEmployee = this.nestedOrgData[0];
    this.dropDownDisplayedEmployee = employee.fullName;
    this.displayedEmployee = employee;
    this.selectedEmployee = employee;
  }

  onCancelClick() {
    this.close.emit(true);
  }

  onSelectClick() {
    this.selectedEmployee.checkAllTeams = this.checkAggregateAllTeams ? true : false;
    this.selectedManager.emit(this.selectedEmployee);
    // this.close.emit(true);
  }

  getDropDownStyle(): any {
    if (this.waitingForOrgData) {
      return {'background-color': 'rgb(245, 245, 245)', cursor: 'wait'};
    } else {
      return {'background-color': 'rgb(255, 255, 255)'};
    }
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

  onclickedEmployee(employee) {
    this.displayOrgDropDown = false;
    this.displayedEmployee = employee;
    this.selectedEmployee = employee;
    // console.log('selected employee');
    // console.log(this.selectedEmployee);

    this.dropDownDisplayedEmployee = employee.fullName;
    this.collapseOrg(this.nestedOrgData);

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

  onCheckAggregateAllTeams(event: any) {
    this.checkAggregateAllTeams = event.target.checked;
  }
}
