import { Injectable } from '@angular/core';

import { ToolsService } from '../_shared/services/tools.service';
import { AuthService } from '../_shared/services/auth.service';
import { DashboardMessage } from './dashboard-message-model';

import * as _ from 'lodash';
import * as moment from 'moment';


@Injectable()
export class DashboardMessagesService {

  constructor(
    private toolsService: ToolsService,
    private authService: AuthService
  ) { }

  // return an array of objects with messages
  // NOTE: res is an array of fteData, firstLogin, projectRequests (forkjoin)
  displayMessages(res): any {

    // initialize the messages array
    const messages: DashboardMessage[] = [];

    // check for a first login message and push it into the messages array
    const firstLogin = this.checkFirstLogin(res[1]);
    if (firstLogin) {
      messages.push(firstLogin);
    }

    // check for a first login message and push it into the messages array
    const noJobTitle = this.checkNoJobTitle(res[3]);
    if (noJobTitle) {
      messages.push(noJobTitle);
    }

    // checkc for open, submitted project requests for this user; build a message and push it into the array
    const projectRequests = this.checkProjectRequests(res[2]);
    if (projectRequests) {
      messages.push(projectRequests);
    }

    // checkc for upcoming or expired deadline for fte entry
    const fteDeadline = this.checkFTEEntryDeadline(res[0]);
    if (fteDeadline) {
      messages.push(fteDeadline);
    }

    // if there are no messages, add a message saying there are no messages at this time
    if (!messages.length) {
      messages.push({
        id: 'noMessages',
        iconFontClass: 'nc-archive-check',
        iconType: 'info',
        messageText: `You have no new messages right now.`
      });
    }

    // return the messages
    return messages;

  }

  checkFirstLogin(check): DashboardMessage {

    if (check.clickCount[0].ClickCount === 0) {
      return {
        id: 'welcomeMessage',
        iconFontClass: 'nc-privacy-policy',
        iconType: 'info',
        messageText: `Welcome to Jarvis Resources! You will be given a short
          guided tutorial when you go to the FTE Entry Page.`
      };
    } else {
      return undefined;
    }

  }


  checkNoJobTitle(check): DashboardMessage {

    if (!check.jobTitle[0].JobTitleID) {
      const initial = this.authService.loggedInUser.fullName[0].toUpperCase();
      return {
        id: 'updateProfileMessage',
        iconFontClass: 'nc-badge',
        iconType: 'warning',
        messageText: `Please update your profile with your job title and subtitle -
        click the ${initial} icon in the upper right hand corner then the profile button.
        You won't be able to enter your fte values until this has been updated.`
      };
    } else {
      return undefined;
    }

  }


  checkProjectRequests(check): DashboardMessage {

    // if there are any open, submitted requests for this user
    if (check.requests.length) {

      // get the request count as a word
      const requestCount = this.toolsService.numberToWord(check.requests.length);

      // create an array of unique project names that require approval
      let projects: string[] = [];
      check.requests.forEach(request => {
        projects.push(request.ProjectName);
      });
      projects = _.uniq(projects);

      // build a string with the list of projects that require approval
      let projectsList: string;
      // if there is one project, just add it to the list
      if (projects.length === 1) {
        projectsList = projects[0];
      // if there are two projects, separate with 'and'
      } else if (projects.length === 2) {
        projectsList = projects.join(' and ');
      // if there are three are more projects, separate with commmas, and 'and'
      } else {
        const lastProject = projects[projects.length - 1];
        projects = projects.slice(0, projects.length - 1);
        projectsList = projects.join(', ') + ', and ' + lastProject;
      }

      // return the object
      return {
        id: 'projectRequestsMessage',
        iconFontClass: 'nc-a-check',
        iconType: 'alert',
        messageText: `You have ${requestCount} new request${check.requests.length > 1 ? 's' : ''} to join your
          project${projects.length > 1 ? 's' : ''} ${projectsList}.
          Go to the Projects page to accept or deny the requests.`
      };

    // if there are no requests, return undefined
    } else {
      return undefined;
    }

  }


  checkFTEEntryDeadline(fteData): DashboardMessage {

    // set the deadline, in units of number of weeks since the 1st day of the quarter
    const deadlineWeeks = 3;

    // filter to get only the logged in user's fte values
    const userfteData = fteData.filter(employee => {
      return employee.emailAddress === this.authService.loggedInUser.email;
    });

    // sum up total fte number across all the user's projects (will be for the current quarter always)
    let fteTotal = 0;
    if (fteData[0].hasOwnProperty('projects')) {
      fteData[0].projects.forEach(project => {
        if (project.hasOwnProperty('ftes')) {
          project.ftes.forEach(month => {
            fteTotal += month.fte;
          });
        }
      });
    }

    // if the total is three, the fte entry is complete and no message should be displayed
    if (this.toolsService.roundTo(fteTotal, 2) === 3.00) {
      return undefined;

    // otherwise, create and return the message
    } else {

      // get today's date
      const today = moment();

      // get the deadline as a date (moment)
      const deadline = moment(this.toolsService.fiscalQuarterRange(moment(), 'YYYY-MM-DD')[0]).add(deadlineWeeks, 'weeks');

      // get the deadline as a string
      const deadlineString = deadline.format('dddd, MMMM Do');

      // where today is before the deadline
      let passedDeadline: boolean;
      let timeSinceDeadline: string;
      if (today <= deadline) {
        passedDeadline = false;
        timeSinceDeadline = deadline.from(today);
        // console.log('time before deadline');
        // console.log(timeSinceDeadline);
      // where today is after the deadline
      } else {
        passedDeadline = true;
        timeSinceDeadline = today.to(deadline);
        // console.log('time after deadline');
        // console.log(timeSinceDeadline);
      }

      // return the object
      return {
        id: 'fteDeadlineMessage',
        iconFontClass: 'nc--stopwatch',
        iconType: passedDeadline ? 'warning' : 'concern',
        messageText: `The deadline to enter your FTE entries for this quarter
          ${passedDeadline ? ' was' : ' is'} ${deadlineString} (${timeSinceDeadline}).`
      };


    }


  }

}
