import { Injectable } from '@angular/core';

import { ToolsService } from '../_shared/services/tools.service';

import * as _ from 'lodash';


@Injectable()
export class DashboardMessagesService {

  constructor(
    private toolsService: ToolsService
  ) { }

  // return an array of objects with messages
  // NOTE: res is an array of fteData, firstLogin, projectRequests (forkjoin)
  displayMessages(res): any {

    // initialize the messages array
    const messages: any[] = [];

    // check for a first login message and push it into the messages array
    const firstLogin = this.checkFirstLogin(res[1]);
    if (firstLogin) {
      messages.push(firstLogin);
    }

    // checkc for open, submitted project requests for this user; build a message and push it into the array
    const projectRequests = this.checkProjectRequests(res[2]);
    if (projectRequests) {
      messages.push(projectRequests);
    }

    // if there are no messages, add a message saying there are no messages at this time
    if (!messages.length) {
      messages.push({
        iconFontClass: 'nc-archive-check',
        iconType: 'info',
        messageText: `You have no new messages right now.`
      });
    }

    // return the messages
    return messages;

  }

  checkFirstLogin(check): any {

    if (check.firstLogin) {
      return {
        iconFontClass: 'nc-privacy-policy',
        iconType: 'info',
        messageText: `Welcome to Jarvis Resources! You will be given a short
          guided tutorial when you go to the FTE Entry Page.`
      };
    } else {
      return undefined;
    }

  }

  checkProjectRequests(check): any {

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
        iconFontClass: 'nc-a-check',
        iconType: 'alert',
        messageText: `You have ${requestCount} new request${check.requests.length > 1 ? 's' : ''} to join your
          project${projects.length > 1 ? 's' : ''} ${projectsList}.
          Go to the Projects page to approve or deny the requests.`
      };

    // if there are no requests, return undefined
    } else {
      return undefined;
    }

  }

}
