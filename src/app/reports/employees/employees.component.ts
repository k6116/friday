import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CacheService } from '../../_shared/services/cache.service';
import { ApiDataOrgService, ApiDataReportService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';

import * as Highcharts from 'highcharts';

declare var require: any;
declare var $: any;

require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);

@Component({
  selector: 'app-employees-reports',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css', '../../_shared/styles/common.css']
})
export class EmployeesReportsComponent implements OnInit, OnDestroy {

  // TO-DO BILL: move employee dropdown to its own shared component

  // Paul moved the org-dropdown component into the team-fte-summary component.
  // No changes were made in the employees component and org-dropdown component.
  // So the org-dropdown component can be moved back to the employees component and everything should work the same.

  nestedOrgData2: any;
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

  // temp properties for testing
  manager: any;
  managerString: string;
  employees: any;
  employeesString: string;
  teamMembers: any;
  teamMembersString: string;


  constructor(
    private cacheService: CacheService,
    private apiDataReportService: ApiDataReportService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService
  ) {

    this.displayOrgDropDown = false;
    this.dropDownDisplayedEmployee = 'Loading...';


    this.nestedOrgData2 = [{
      'uid':825,
      'personID':167759,
      'employeeID':56,
      'fullName':'Trevor Buehl',
      'emailAddress':'trevor_buehl@keysight.com',
      'supervisorID':4551,
      'supervisorEmailAddress':'pat_harper@keysight.com',
      'level':4,
      'numEmployees':12,
      'showEmployees':false,
      'employees':[
         {
            'uid':7671,
            'personID':111281,
            'employeeID':179,
            'fullName':'Arash Ghanadan',
            'emailAddress':'arash_ghanadan@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':7,
            'showEmployees':false,
            'employees':[
               {
                  'uid':13247,
                  'personID':214442,
                  'employeeID':0,
                  'fullName':'Christine King',
                  'emailAddress':'christine.king@keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'level':6,
                  'numEmployees':9,
                  'showEmployees':false,
                  'employees':[
                     {
                        'uid':17722,
                        'personID':9586,
                        'employeeID':0,
                        'fullName':'Daniel J Mc Cullough',
                        'emailAddress':'daniel.mc-cullough@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17723,
                        'personID':13071,
                        'employeeID':0,
                        'fullName':'Gil Strand',
                        'emailAddress':'gil_strand@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17724,
                        'personID':4694,
                        'employeeID':0,
                        'fullName':'Gordon Stuck',
                        'emailAddress':'gordon_stuck@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17725,
                        'personID':48181,
                        'employeeID':0,
                        'fullName':'Jeff Shamrock',
                        'emailAddress':'jeff_shamrock@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17726,
                        'personID':164358,
                        'employeeID':0,
                        'fullName':'Kevin Louchis',
                        'emailAddress':'kevin_louchis@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17727,
                        'personID':217603,
                        'employeeID':0,
                        'fullName':'Michael OFlaherty',
                        'emailAddress':'michael.oflaherty@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17728,
                        'personID':20990,
                        'employeeID':0,
                        'fullName':'Mike Brown',
                        'emailAddress':'mike_brown@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17729,
                        'personID':22882,
                        'employeeID':0,
                        'fullName':'Steve Hughes',
                        'emailAddress':'steven_hughes@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17730,
                        'personID':219381,
                        'employeeID':0,
                        'fullName':'Vi Thai',
                        'emailAddress':'vi.thai@keysight.com',
                        'supervisorID':214442,
                        'supervisorEmailAddress':'christine.king@keysight.com',
                        'organizationID':71,
                        'organizationName':'WDO NPI Santa Rosa',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {
                  'uid':13248,
                  'personID':9196,
                  'employeeID':0,
                  'fullName':'Jim Stock',
                  'emailAddress':'jim_stock@keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'level':6,
                  'numEmployees':9,
                  'showEmployees':false,
                  'employees':[
                     {
                        'uid':15892,
                        'personID':2513,
                        'employeeID':0,
                        'fullName':'Alan Wight',
                        'emailAddress':'alan_wight@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15893,
                        'personID':20478,
                        'employeeID':0,
                        'fullName':'Craig Rogers',
                        'emailAddress':'craig_rogers@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15894,
                        'personID':120983,
                        'employeeID':0,
                        'fullName':'Daniel Schacht',
                        'emailAddress':'dan_schacht@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15895,
                        'personID':21162,
                        'employeeID':0,
                        'fullName':'Don Hincher Jr',
                        'emailAddress':'donald_hincher@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15896,
                        'personID':4586,
                        'employeeID':0,
                        'fullName':'Doug Asselbergs',
                        'emailAddress':'doug_asselbergs@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15897,
                        'personID':21202,
                        'employeeID':0,
                        'fullName':'Kelley B Ward',
                        'emailAddress':'kelley_ward@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15898,
                        'personID':96523,
                        'employeeID':0,
                        'fullName':'Khairul Anwar Mohamad',
                        'emailAddress':'khairul_mohamad@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15899,
                        'personID':1168,
                        'employeeID':0,
                        'fullName':'Mark E Mauerhan',
                        'emailAddress':'mark_mauerhan@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':15900,
                        'personID':219780,
                        'employeeID':0,
                        'fullName':'Ruairi Long',
                        'emailAddress':'ruairi.long@keysight.com',
                        'supervisorID':9196,
                        'supervisorEmailAddress':'jim_stock@keysight.com',
                        'organizationID':68,
                        'organizationName':'Signal Analysis',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {
                  'uid':13249,
                  'personID':156229,
                  'employeeID':0,
                  'fullName':'Jory Jahn',
                  'emailAddress':'jory.jahn@non.keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'organizationID':62,
                  'organizationName':'RF Microwave Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {
                  'uid':13250,
                  'personID':177289,
                  'employeeID':0,
                  'fullName':'Rafael Robles',
                  'emailAddress':'rafael_robles@keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'level':6,
                  'numEmployees':10,
                  'showEmployees':false,
                  'employees':[
                     {
                        'uid':17510,
                        'personID':195987,
                        'employeeID':0,
                        'fullName':'Alejandro Sejas',
                        'emailAddress':'alejandro.sejas@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17511,
                        'personID':177227,
                        'employeeID':0,
                        'fullName':'Alfredo Garcia',
                        'emailAddress':'alfredo_garcia@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17512,
                        'personID':195988,
                        'employeeID':0,
                        'fullName':'Elena Del Campo Merino',
                        'emailAddress':'elena.merino@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {
                        'uid':17513,
                        'personID':177294,
                        'employeeID':0,
                        'fullName':'Francisco Jose Roman',
                        'emailAddress':'francis_roman@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17514,
                        'personID':209032,
                        'employeeID':0,
                        'fullName':'Francisco Javier Ruiz Racero',
                        'emailAddress':'francisco.racero@non.keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17515,
                        'personID':177249,
                        'employeeID':0,
                        'fullName':'Jeronimo Leon',
                        'emailAddress':'jero_leon@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17516,
                        'personID':177195,
                        'employeeID':0,
                        'fullName':'Miguel Bautista',
                        'emailAddress':'miguel_bautista@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17517,
                        'personID':177247,
                        'employeeID':0,
                        'fullName':'Miguel Lara',
                        'emailAddress':'miguel_lara@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17518,
                        'personID':68387,
                        'employeeID':0,
                        'fullName':'Ning Wang',
                        'emailAddress':'ning_wang@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17519,
                        'personID':177267,
                        'employeeID':0,
                        'fullName':'Vanessa Moreno',
                        'emailAddress':'vanessa_moreno@keysight.com',
                        'supervisorID':177289,
                        'supervisorEmailAddress':'rafael_robles@keysight.com',
                        'organizationID':70,
                        'organizationName':'Malaga Test System',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':13251,
                  'personID':219242,
                  'employeeID':0,
                  'fullName':'Salar Khoshfahm',
                  'emailAddress':'salar.khoshfahm@non.keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'organizationID':62,
                  'organizationName':'RF Microwave Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':13252,
                  'personID':11528,
                  'employeeID':0,
                  'fullName':'Stan Souza',
                  'emailAddress':'stan_souza@keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'level':6,
                  'numEmployees':13,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':15933,
                        'personID':3957,
                        'employeeID':0,
                        'fullName':'Albert Srichai',
                        'emailAddress':'albert_srichai@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15934,
                        'personID':197029,
                        'employeeID':0,
                        'fullName':'Anthony Disbrow',
                        'emailAddress':'anthony.disbrow@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15935,
                        'personID':163497,
                        'employeeID':0,
                        'fullName':'Brandon Hincher',
                        'emailAddress':'brandon_hincher@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15936,
                        'personID':21045,
                        'employeeID':0,
                        'fullName':'Jack Fields',
                        'emailAddress':'jack.fields@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15937,
                        'personID':217503,
                        'employeeID':0,
                        'fullName':'Jeff Tan',
                        'emailAddress':'jeff.tan@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15938,
                        'personID':2670,
                        'employeeID':0,
                        'fullName':'John W Johnson',
                        'emailAddress':'john_johnson@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15939,
                        'personID':1534,
                        'employeeID':0,
                        'fullName':'Kurt Harrison',
                        'emailAddress':'kurt_harrison@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15940,
                        'personID':200341,
                        'employeeID':0,
                        'fullName':'Matt Farnham',
                        'emailAddress':'matthew.farnham@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15941,
                        'personID':48424,
                        'employeeID':0,
                        'fullName':'Paul J Eagar',
                        'emailAddress':'paul_eagar@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15942,
                        'personID':4094,
                        'employeeID':0,
                        'fullName':'Salam Marougi',
                        'emailAddress':'salam_marougi@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15943,
                        'personID':9772,
                        'employeeID':0,
                        'fullName':'Shiyu Wang',
                        'emailAddress':'shi-yu_wang@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15944,
                        'personID':16040,
                        'employeeID':0,
                        'fullName':'Steve Vonk',
                        'emailAddress':'steve_vonk@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15945,
                        'personID':4592,
                        'employeeID':0,
                        'fullName':'William Gibson',
                        'emailAddress':'william_gibson@keysight.com',
                        'supervisorID':11528,
                        'supervisorEmailAddress':'stan_souza@keysight.com',
                        'organizationID':69,
                        'organizationName':'Signal Sources',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':13253,
                  'personID':393,
                  'employeeID':0,
                  'fullName':'Tom Taylor',
                  'emailAddress':'tom_taylor@keysight.com',
                  'supervisorID':111281,
                  'supervisorEmailAddress':'arash_ghanadan@keysight.com',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         },
         {  
            'uid':7672,
            'personID':134726,
            'employeeID':68,
            'fullName':'Barry Demartini',
            'emailAddress':'barry_demartini@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':5,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':13528,
                  'personID':168605,
                  'employeeID':0,
                  'fullName':'Beth Richter',
                  'emailAddress':'beth_richter@keysight.com',
                  'supervisorID':134726,
                  'supervisorEmailAddress':'barry_demartini@keysight.com',
                  'level':6,
                  'numEmployees':13,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':17485,
                        'personID':44341,
                        'employeeID':0,
                        'fullName':'Robert C Mellinger',
                        'emailAddress':'bob_mellinger@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17486,
                        'personID':25742,
                        'employeeID':0,
                        'fullName':'Conrad Proft',
                        'emailAddress':'conrad.proft@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17487,
                        'personID':173319,
                        'employeeID':0,
                        'fullName':'Dmitri Kagan',
                        'emailAddress':'dmitri_kagan@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17488,
                        'personID':26243,
                        'employeeID':0,
                        'fullName':'Michael Dobbert',
                        'emailAddress':'dobbert@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17489,
                        'personID':4980,
                        'employeeID':0,
                        'fullName':'Erwin Siegel',
                        'emailAddress':'erwin_siegel@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17490,
                        'personID':4487,
                        'employeeID':0,
                        'fullName':'John Koczerzuk',
                        'emailAddress':'john_koczerzuk@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17491,
                        'personID':3454,
                        'employeeID':0,
                        'fullName':'Mike Redig',
                        'emailAddress':'mike_redig@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17492,
                        'personID':8969,
                        'employeeID':0,
                        'fullName':'Rick James',
                        'emailAddress':'rjames@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17493,
                        'personID':206135,
                        'employeeID':0,
                        'fullName':'Robert Williams',
                        'emailAddress':'robert.williams@non.keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17494,
                        'personID':203150,
                        'employeeID':0,
                        'fullName':'Rohan Phadke',
                        'emailAddress':'rohan.phadke@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17495,
                        'personID':44395,
                        'employeeID':0,
                        'fullName':'Tom Le',
                        'emailAddress':'tom_le@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17496,
                        'personID':224004,
                        'employeeID':0,
                        'fullName':'Vanessa Guzman',
                        'emailAddress':'vanessa.guzman@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17497,
                        'personID':34031,
                        'employeeID':0,
                        'fullName':'Xiaolong Li',
                        'emailAddress':'xiao-long_li@keysight.com',
                        'supervisorID':168605,
                        'supervisorEmailAddress':'beth_richter@keysight.com',
                        'organizationID':81,
                        'organizationName':'Santa Rosa Hardware Test Center',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':13529,
                  'personID':20550,
                  'employeeID':0,
                  'fullName':'Ermina Chua',
                  'emailAddress':'ermina_chua@keysight.com',
                  'supervisorID':134726,
                  'supervisorEmailAddress':'barry_demartini@keysight.com',
                  'level':6,
                  'numEmployees':14,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':16283,
                        'personID':222847,
                        'employeeID':0,
                        'fullName':'Cheryl Wolski',
                        'emailAddress':'cheryl.wolski@non.keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16284,
                        'personID':166724,
                        'employeeID':0,
                        'fullName':'Doug Kehren',
                        'emailAddress':'doug.kehren@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16285,
                        'personID':6859,
                        'employeeID':0,
                        'fullName':'Gerald Ruiz',
                        'emailAddress':'gerald_ruiz@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16286,
                        'personID':192514,
                        'employeeID':0,
                        'fullName':'Jameson Carle',
                        'emailAddress':'jameson.carle@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16287,
                        'personID':224443,
                        'employeeID':0,
                        'fullName':'Jay Smith',
                        'emailAddress':'jay.smith@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16288,
                        'personID':20704,
                        'employeeID':0,
                        'fullName':'Karen Spahr',
                        'emailAddress':'karen_spahr@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16289,
                        'personID':200008,
                        'employeeID':0,
                        'fullName':'Ken Berger',
                        'emailAddress':'ken.berger@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16290,
                        'personID':223983,
                        'employeeID':0,
                        'fullName':'Matthew Alexander',
                        'emailAddress':'matthew.alexander@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16291,
                        'personID':109548,
                        'employeeID':0,
                        'fullName':'Michelle Tucker',
                        'emailAddress':'michelle_tucker@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16292,
                        'personID':52836,
                        'employeeID':0,
                        'fullName':'Molly Nord',
                        'emailAddress':'molly.nord@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16293,
                        'personID':224065,
                        'employeeID':0,
                        'fullName':'Nathan Hill',
                        'emailAddress':'nathan.hill@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16294,
                        'personID':36631,
                        'employeeID':0,
                        'fullName':'Ron Erickson',
                        'emailAddress':'ron_erickson@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16295,
                        'personID':20616,
                        'employeeID':0,
                        'fullName':'Shirley Pereira-Ellis',
                        'emailAddress':'shirley_pereira@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16296,
                        'personID':7282,
                        'employeeID':0,
                        'fullName':'Steve Jorgensen',
                        'emailAddress':'steve_jorgensen@keysight.com',
                        'supervisorID':20550,
                        'supervisorEmailAddress':'ermina_chua@keysight.com',
                        'organizationID':65,
                        'organizationName':'Real Time Oscilloscope and Logic\/Protocol',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':13530,
                  'personID':11868,
                  'employeeID':0,
                  'fullName':'John Grubb',
                  'emailAddress':'john_grubb@keysight.com',
                  'supervisorID':134726,
                  'supervisorEmailAddress':'barry_demartini@keysight.com',
                  'level':6,
                  'numEmployees':12,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':16084,
                        'personID':2507,
                        'employeeID':0,
                        'fullName':'Carol Hale',
                        'emailAddress':'carol_hale@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16085,
                        'personID':34151,
                        'employeeID':0,
                        'fullName':'Darin Scott',
                        'emailAddress':'darin_scott@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16086,
                        'personID':81609,
                        'employeeID':0,
                        'fullName':'Hui Chen Jamie Leow',
                        'emailAddress':'hui-chen-jamie_leow@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16087,
                        'personID':48945,
                        'employeeID':0,
                        'fullName':'James Shatara',
                        'emailAddress':'james_shatara@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16088,
                        'personID':218108,
                        'employeeID':0,
                        'fullName':'Jeff Barnard',
                        'emailAddress':'jeff.barnard@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16089,
                        'personID':728,
                        'employeeID':0,
                        'fullName':'John Wan',
                        'emailAddress':'john_wan@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16090,
                        'personID':200342,
                        'employeeID':0,
                        'fullName':'Longye Chen',
                        'emailAddress':'longye.chen@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16091,
                        'personID':209225,
                        'employeeID':0,
                        'fullName':'Michael Figueroa',
                        'emailAddress':'michael.figueroa@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16092,
                        'personID':205054,
                        'employeeID':0,
                        'fullName':'Nick Catelani',
                        'emailAddress':'nick.catelani@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16093,
                        'personID':26883,
                        'employeeID':0,
                        'fullName':'Qinjian Deng',
                        'emailAddress':'qinjian_deng@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16094,
                        'personID':202324,
                        'employeeID':0,
                        'fullName':'Scott Ireton',
                        'emailAddress':'scott.ireton@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16095,
                        'personID':189725,
                        'employeeID':0,
                        'fullName':'Ysrael Salire',
                        'emailAddress':'ysrael.salire@keysight.com',
                        'supervisorID':11868,
                        'supervisorEmailAddress':'john_grubb@keysight.com',
                        'organizationID':64,
                        'organizationName':'NA Explorer Program and Quality',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':13531,
                  'personID':217305,
                  'employeeID':0,
                  'fullName':'Kara Bogner',
                  'emailAddress':'kara.bogner@keysight.com',
                  'supervisorID':134726,
                  'supervisorEmailAddress':'barry_demartini@keysight.com',
                  'organizationID':61,
                  'organizationName':'Digital and Network Analysis',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':13532,
                  'personID':92564,
                  'employeeID':0,
                  'fullName':'Laura Mccarter',
                  'emailAddress':'laura_mccarter@keysight.com',
                  'supervisorID':134726,
                  'supervisorEmailAddress':'barry_demartini@keysight.com',
                  'level':6,
                  'numEmployees':13,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':17051,
                        'personID':216603,
                        'employeeID':0,
                        'fullName':'Andrew Wylde',
                        'emailAddress':'andrew.wylde@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17052,
                        'personID':47729,
                        'employeeID':0,
                        'fullName':'Anu Vaze',
                        'emailAddress':'anu.vaze@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17053,
                        'personID':4437,
                        'employeeID':0,
                        'fullName':'Archie Fraser',
                        'emailAddress':'archibald.fraser@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17054,
                        'personID':222307,
                        'employeeID':0,
                        'fullName':'Craig Walsh',
                        'emailAddress':'craig.walsh@non.keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17055,
                        'personID':217989,
                        'employeeID':0,
                        'fullName':'Gary Nguyen',
                        'emailAddress':'gary.nguyen2@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17056,
                        'personID':204704,
                        'employeeID':0,
                        'fullName':'Jon Fish',
                        'emailAddress':'jonathan.fish@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17057,
                        'personID':209105,
                        'employeeID':0,
                        'fullName':'Jorge Inocencio Madrigal',
                        'emailAddress':'jorge.inocencio@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17058,
                        'personID':26986,
                        'employeeID':0,
                        'fullName':'Jun Li',
                        'emailAddress':'jun_li@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17059,
                        'personID':215164,
                        'employeeID':0,
                        'fullName':'Nader Srouji',
                        'emailAddress':'nader.srouji@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17060,
                        'personID':11745,
                        'employeeID':0,
                        'fullName':'Phil Spratt',
                        'emailAddress':'phil_spratt@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17061,
                        'personID':223689,
                        'employeeID':0,
                        'fullName':'Robert Disidoro',
                        'emailAddress':'robert.disidoro@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17062,
                        'personID':164908,
                        'employeeID':0,
                        'fullName':'Sheila Messer',
                        'emailAddress':'sheila_messer@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17063,
                        'personID':2925,
                        'employeeID':0,
                        'fullName':'Steven Reynard',
                        'emailAddress':'steven_reynard@keysight.com',
                        'supervisorID':92564,
                        'supervisorEmailAddress':'laura_mccarter@keysight.com',
                        'organizationID':63,
                        'organizationName':'Modular PXI (RF) Systems',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               }
            ]
         },
         {  
            'uid':7673,
            'personID':5059,
            'employeeID':133,
            'fullName':'Carl Hildebrant',
            'emailAddress':'carl_hildebrant@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'organizationID':50,
            'organizationName':'NPI Engineering',
            'level':5,
            'numEmployees':0,
            'showEmployees':false
         },
         {  
            'uid':7674,
            'personID':2125,
            'employeeID':163,
            'fullName':'Doug Knight',
            'emailAddress':'doug_knight@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':3,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':9080,
                  'personID':45784,
                  'employeeID':0,
                  'fullName':'Brian Corbett',
                  'emailAddress':'brian_corbett@keysight.com',
                  'supervisorID':2125,
                  'supervisorEmailAddress':'doug_knight@keysight.com',
                  'level':6,
                  'numEmployees':11,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':16746,
                        'personID':5953,
                        'employeeID':0,
                        'fullName':'Anne Kim',
                        'emailAddress':'anne_kim@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16747,
                        'personID':6700,
                        'employeeID':0,
                        'fullName':'Cathie Loomis',
                        'emailAddress':'cathie.loomis@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16748,
                        'personID':193147,
                        'employeeID':0,
                        'fullName':'Christian Tarr',
                        'emailAddress':'christian.tarr@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16749,
                        'personID':216970,
                        'employeeID':0,
                        'fullName':'Danny Del Cerro Marazuela',
                        'emailAddress':'danny.del_cerro@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16750,
                        'personID':123277,
                        'employeeID':0,
                        'fullName':'Edson Wong',
                        'emailAddress':'edson_wong@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16751,
                        'personID':212010,
                        'employeeID':0,
                        'fullName':'Frankie Jefferson',
                        'emailAddress':'frances.jefferson@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16752,
                        'personID':13337,
                        'employeeID':0,
                        'fullName':'Francis Small',
                        'emailAddress':'francis.small@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16753,
                        'personID':121486,
                        'employeeID':0,
                        'fullName':'Kevin Lin',
                        'emailAddress':'htein_lin@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16754,
                        'personID':9542,
                        'employeeID':0,
                        'fullName':'Jeff Paul',
                        'emailAddress':'jeffery.paul@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16755,
                        'personID':13182,
                        'employeeID':0,
                        'fullName':'Ken Silk',
                        'emailAddress':'ken_silk@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':16756,
                        'personID':37944,
                        'employeeID':0,
                        'fullName':'Saw-Hoon Tan',
                        'emailAddress':'saw-hoon_tan@keysight.com',
                        'supervisorID':45784,
                        'supervisorEmailAddress':'brian_corbett@keysight.com',
                        'organizationID':117,
                        'organizationName':'CalSoft SA-SS FieldFox',
                        'level':7,
                        'numEmployees':2,
                        'showEmployees':false,
                        'employees':[  
                           {  
                              'uid':18215,
                              'personID':122657,
                              'employeeID':0,
                              'fullName':'Lei Sun Leow',
                              'emailAddress':'lei-sun_leow@keysight.com',
                              'supervisorID':37944,
                              'supervisorEmailAddress':'saw-hoon_tan@keysight.com',
                              'level':8,
                              'numEmployees':0,
                              'showEmployees':false
                           },
                           {  
                              'uid':18216,
                              'personID':176304,
                              'employeeID':0,
                              'fullName':'Xu Ying Wong',
                              'emailAddress':'xu-ying_wong@keysight.com',
                              'supervisorID':37944,
                              'supervisorEmailAddress':'saw-hoon_tan@keysight.com',
                              'level':8,
                              'numEmployees':0,
                              'showEmployees':false
                           }
                        ]
                     }
                  ]
               },
               {  
                  'uid':9081,
                  'personID':6724,
                  'employeeID':0,
                  'fullName':'Don Walker',
                  'emailAddress':'donald_walker@keysight.com',
                  'supervisorID':2125,
                  'supervisorEmailAddress':'doug_knight@keysight.com',
                  'level':6,
                  'numEmployees':14,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':15809,
                        'personID':158700,
                        'employeeID':0,
                        'fullName':'Bill Simerly',
                        'emailAddress':'bill_simerly@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15810,
                        'personID':162812,
                        'employeeID':0,
                        'fullName':'Breck Beatie',
                        'emailAddress':'breck_beatie@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15811,
                        'personID':124125,
                        'employeeID':0,
                        'fullName':'Carlos Molina',
                        'emailAddress':'carlos_molina@non.keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15812,
                        'personID':111939,
                        'employeeID':0,
                        'fullName':'Don Louie',
                        'emailAddress':'don_louie@non.keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15813,
                        'personID':2428,
                        'employeeID':0,
                        'fullName':'Dwayne A Smallen',
                        'emailAddress':'dwayne_smallen@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15814,
                        'personID':48042,
                        'employeeID':0,
                        'fullName':'Jon Moens',
                        'emailAddress':'jon_moens@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15815,
                        'personID':30034,
                        'employeeID':0,
                        'fullName':'Julie Lin',
                        'emailAddress':'julie_lin@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15816,
                        'personID':27166,
                        'employeeID':0,
                        'fullName':'Ming-Chuan Yan',
                        'emailAddress':'ming-chuan_yan@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15817,
                        'personID':224554,
                        'employeeID':0,
                        'fullName':'Noah Tarr',
                        'emailAddress':'noah.tarr@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15818,
                        'personID':11781,
                        'employeeID':0,
                        'fullName':'Seberio Hernandez',
                        'emailAddress':'seberio_hernandez@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15819,
                        'personID':44138,
                        'employeeID':0,
                        'fullName':'Swei Ea',
                        'emailAddress':'swei_ea@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15820,
                        'personID':1687,
                        'employeeID':0,
                        'fullName':'Terry Haynes',
                        'emailAddress':'terrence.haynes@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15821,
                        'personID':201975,
                        'employeeID':0,
                        'fullName':'Tony Rodriguez Heredia',
                        'emailAddress':'tony.rodriguez@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15822,
                        'personID':2169,
                        'employeeID':0,
                        'fullName':'Wayne Madgett',
                        'emailAddress':'wayne_madgett@keysight.com',
                        'supervisorID':6724,
                        'supervisorEmailAddress':'donald_walker@keysight.com',
                        'organizationID':118,
                        'organizationName':'CalSoft Network Analysis and Modular Test Dev. Process',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':9082,
                  'personID':2107,
                  'employeeID':0,
                  'fullName':'Mark Coomes',
                  'emailAddress':'mark.coomes@keysight.com',
                  'supervisorID':2125,
                  'supervisorEmailAddress':'doug_knight@keysight.com',
                  'level':6,
                  'numEmployees':13,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':15598,
                        'personID':201874,
                        'employeeID':0,
                        'fullName':'Claudia Sahagun',
                        'emailAddress':'claudia.sahagun@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15599,
                        'personID':26862,
                        'employeeID':0,
                        'fullName':'David L. Cross',
                        'emailAddress':'david_l_cross@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15600,
                        'personID':48871,
                        'employeeID':0,
                        'fullName':'Duane West',
                        'emailAddress':'duane_west@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15601,
                        'personID':200623,
                        'employeeID':0,
                        'fullName':'Gary Lake',
                        'emailAddress':'gary_lake@non.keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15602,
                        'personID':3268,
                        'employeeID':0,
                        'fullName':'Jim Andrews',
                        'emailAddress':'jim_andrews@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15603,
                        'personID':202190,
                        'employeeID':0,
                        'fullName':'Jo-El Tay',
                        'emailAddress':'jo-el.tay@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15604,
                        'personID':162507,
                        'employeeID':0,
                        'fullName':'John Costanza',
                        'emailAddress':'john_costanza@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15605,
                        'personID':167760,
                        'employeeID':0,
                        'fullName':'Kai Sek Lim',
                        'emailAddress':'kai-sek_lim@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15606,
                        'personID':22117,
                        'employeeID':0,
                        'fullName':'Mary Sun',
                        'emailAddress':'mary_sun@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15607,
                        'personID':48856,
                        'employeeID':0,
                        'fullName':'Patrick Yancey',
                        'emailAddress':'patrick_yancey@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15608,
                        'personID':23505,
                        'employeeID':0,
                        'fullName':'Raymond Kelly',
                        'emailAddress':'raymond_kelly@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15609,
                        'personID':48252,
                        'employeeID':0,
                        'fullName':'Robert Nelson',
                        'emailAddress':'robert_nelson@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15610,
                        'personID':3456,
                        'employeeID':0,
                        'fullName':'Scott Selberg',
                        'emailAddress':'scott_selberg@keysight.com',
                        'supervisorID':2107,
                        'supervisorEmailAddress':'mark.coomes@keysight.com',
                        'organizationID':119,
                        'organizationName':'Gondor ETMS Test Platform',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               }
            ]
         },
         {  
            'uid':7675,
            'personID':1424,
            'employeeID':0,
            'fullName':'Ernie De Martini',
            'emailAddress':'ernie_demartini@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':10,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':9037,
                  'personID':212802,
                  'employeeID':0,
                  'fullName':'Andrew Miller',
                  'emailAddress':'andrew.miller@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9038,
                  'personID':48467,
                  'employeeID':0,
                  'fullName':'Diane Y Dai',
                  'emailAddress':'diane_dai@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9039,
                  'personID':224245,
                  'employeeID':0,
                  'fullName':'John Noe',
                  'emailAddress':'john.noe@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9040,
                  'personID':216163,
                  'employeeID':0,
                  'fullName':'Loren Kline',
                  'emailAddress':'loren.kline@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9041,
                  'personID':215406,
                  'employeeID':0,
                  'fullName':'Mick Kramer',
                  'emailAddress':'mick.kramer@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9042,
                  'personID':3261,
                  'employeeID':0,
                  'fullName':'Ramesh Ramakrishna',
                  'emailAddress':'ramesh_ramakrishna@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9043,
                  'personID':21194,
                  'employeeID':0,
                  'fullName':'Ronnie Verrall',
                  'emailAddress':'ronette_verrall@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9044,
                  'personID':173226,
                  'employeeID':0,
                  'fullName':'Savitha Palaniappan',
                  'emailAddress':'savitha.palaniappan@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9045,
                  'personID':22029,
                  'employeeID':0,
                  'fullName':'Ted Bliss',
                  'emailAddress':'ted.bliss@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9046,
                  'personID':12109,
                  'employeeID':0,
                  'fullName':'William Gilchrist',
                  'emailAddress':'william_gilchrist@keysight.com',
                  'supervisorID':1424,
                  'supervisorEmailAddress':'ernie_demartini@keysight.com',
                  'organizationID':115,
                  'organizationName':'Santa Rosa DPT NPI \/ Sampling Scopes\/AWG\/BERT',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         },
         {  
            'uid':7676,
            'personID':22286,
            'employeeID':143,
            'fullName':'Ethan Hunt',
            'emailAddress':'ethan_hunt@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':23,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':9941,
                  'personID':5011,
                  'employeeID':2,
                  'fullName':'Bill Schuetzle',
                  'emailAddress':'bill_schuetzle@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9942,
                  'personID':22903,
                  'employeeID':0,
                  'fullName':'Brian Ivanoff',
                  'emailAddress':'brian_ivanoff@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9943,
                  'personID':191724,
                  'employeeID':58,
                  'fullName':'Bryan Cheung',
                  'emailAddress':'bryan.cheung@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9944,
                  'personID':4816,
                  'employeeID':0,
                  'fullName':'Donna Abbott',
                  'emailAddress':'donna_abbott@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9945,
                  'personID':6155,
                  'employeeID':181,
                  'fullName':'Jaime Hernandez',
                  'emailAddress':'jaime_hernandez@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9946,
                  'personID':130375,
                  'employeeID':0,
                  'fullName':'Jan Kerr',
                  'emailAddress':'jan.kerr@non.keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9947,
                  'personID':217884,
                  'employeeID':0,
                  'fullName':'Jessica Hampton',
                  'emailAddress':'jessica.hampton@non.keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9948,
                  'personID':31964,
                  'employeeID':0,
                  'fullName':'Joanne Brown',
                  'emailAddress':'joanne.brown@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9949,
                  'personID':11689,
                  'employeeID':0,
                  'fullName':'Katie Tockey',
                  'emailAddress':'katie_tockey2@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9950,
                  'personID':33968,
                  'employeeID':0,
                  'fullName':'Laura Housley',
                  'emailAddress':'laura.housley@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9951,
                  'personID':173592,
                  'employeeID':0,
                  'fullName':'Luke Haley',
                  'emailAddress':'luke.haley@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9952,
                  'personID':219620,
                  'employeeID':113,
                  'fullName':'Matthew Maier',
                  'emailAddress':'matthew.maier2@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9953,
                  'personID':203455,
                  'employeeID':125,
                  'fullName':'Mike Galasso',
                  'emailAddress':'mike.galasso@non.keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9954,
                  'personID':215982,
                  'employeeID':0,
                  'fullName':'Nehad Dababo',
                  'emailAddress':'nehad.dababo@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9955,
                  'personID':211887,
                  'employeeID':184,
                  'fullName':'Osamah Omer',
                  'emailAddress':'osamah.omer@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9956,
                  'personID':167160,
                  'employeeID':1,
                  'fullName':'Paul Sung',
                  'emailAddress':'paul_sung@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9957,
                  'personID':50982,
                  'employeeID':180,
                  'fullName':'Rick Ruthnick',
                  'emailAddress':'richard.ruthnick@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9958,
                  'personID':223141,
                  'employeeID':0,
                  'fullName':'Senthilvel Perumal',
                  'emailAddress':'senthilvelt@pranaglobal.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9959,
                  'personID':54381,
                  'employeeID':0,
                  'fullName':'Susan Briski',
                  'emailAddress':'susan.briski@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9960,
                  'personID':27349,
                  'employeeID':0,
                  'fullName':'Tamu Walton',
                  'emailAddress':'tamu_walton@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9961,
                  'personID':30027,
                  'employeeID':0,
                  'fullName':'Tina Vannetti',
                  'emailAddress':'tina_vannetti@keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9962,
                  'personID':218814,
                  'employeeID':0,
                  'fullName':'Vijay Subramanian',
                  'emailAddress':'vijays@pranaglobal.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9963,
                  'personID':130242,
                  'employeeID':183,
                  'fullName':'Warner Keeley',
                  'emailAddress':'warner_keeley@non.keysight.com',
                  'supervisorID':22286,
                  'supervisorEmailAddress':'ethan_hunt@keysight.com',
                  'organizationID':73,
                  'organizationName':'NPI Supply Chain Engineering',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         },
         {  
            'uid':7677,
            'personID':30118,
            'employeeID':151,
            'fullName':'Jennifer Foley',
            'emailAddress':'jennifer_foley@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':33,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':10281,
                  'personID':44263,
                  'employeeID':0,
                  'fullName':'Adrian Reyes',
                  'emailAddress':'adrian.reyes@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10282,
                  'personID':28801,
                  'employeeID':0,
                  'fullName':'Alan Hitman',
                  'emailAddress':'alan_hitman@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10283,
                  'personID':8945,
                  'employeeID':0,
                  'fullName':'Ana M Guillory',
                  'emailAddress':'ana_guillory@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10284,
                  'personID':1114,
                  'employeeID':0,
                  'fullName':'Anita Duncan',
                  'emailAddress':'anita_duncan@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10285,
                  'personID':201615,
                  'employeeID':0,
                  'fullName':'Brandon Postlethwaite',
                  'emailAddress':'brandon.postlethwaite@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10286,
                  'personID':20291,
                  'employeeID':0,
                  'fullName':'Carly Cummins',
                  'emailAddress':'carly.cummins7@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10287,
                  'personID':47960,
                  'employeeID':0,
                  'fullName':'Dani J. Radford',
                  'emailAddress':'dani_radford@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10288,
                  'personID':151390,
                  'employeeID':0,
                  'fullName':'Daniel Fine',
                  'emailAddress':'daniel_fine@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10289,
                  'personID':219021,
                  'employeeID':0,
                  'fullName':'David Rodrigues',
                  'emailAddress':'david.rodrigues@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10290,
                  'personID':4427,
                  'employeeID':0,
                  'fullName':'Diego Latorre',
                  'emailAddress':'diego_latorre@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10291,
                  'personID':189396,
                  'employeeID':0,
                  'fullName':'Eddy Hauck',
                  'emailAddress':'edward.hauck@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10292,
                  'personID':4027,
                  'employeeID':0,
                  'fullName':'Eric Boehmer',
                  'emailAddress':'eric.boehmer@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10293,
                  'personID':54541,
                  'employeeID':0,
                  'fullName':'Erick Woods',
                  'emailAddress':'erick.woods@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10294,
                  'personID':3480,
                  'employeeID':0,
                  'fullName':'Frank Sojka',
                  'emailAddress':'frank.sojka@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10295,
                  'personID':222863,
                  'employeeID':0,
                  'fullName':'Germain Parra',
                  'emailAddress':'germain.parra@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10296,
                  'personID':219303,
                  'employeeID':0,
                  'fullName':'Herbert Hernandez',
                  'emailAddress':'herbert.hernandez@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10297,
                  'personID':153631,
                  'employeeID':0,
                  'fullName':'Jim Gardner',
                  'emailAddress':'jim.gardner@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10298,
                  'personID':222340,
                  'employeeID':0,
                  'fullName':'John Dunseth',
                  'emailAddress':'john.dunseth@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10299,
                  'personID':3271,
                  'employeeID':0,
                  'fullName':'John Stearley',
                  'emailAddress':'john.stearley@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10300,
                  'personID':219799,
                  'employeeID':0,
                  'fullName':'Linda Coffman',
                  'emailAddress':'linda.coffman@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10301,
                  'personID':205723,
                  'employeeID':0,
                  'fullName':'Lucas Rhymes',
                  'emailAddress':'lucas.rhymes@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10302,
                  'personID':219302,
                  'employeeID':0,
                  'fullName':'Luis Villanueva',
                  'emailAddress':'luis.villanueva@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10303,
                  'personID':4032,
                  'employeeID':0,
                  'fullName':'Matthew E Minix',
                  'emailAddress':'matthew_minix@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10304,
                  'personID':44094,
                  'employeeID':0,
                  'fullName':'Michael Paul',
                  'emailAddress':'michael_d_paul@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10305,
                  'personID':2933,
                  'employeeID':0,
                  'fullName':'Rick Spagnola',
                  'emailAddress':'rick.spagnola@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10306,
                  'personID':217702,
                  'employeeID':0,
                  'fullName':'Sandra Haskin',
                  'emailAddress':'sandra.haskin@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10307,
                  'personID':2284,
                  'employeeID':0,
                  'fullName':'Scott Henigan',
                  'emailAddress':'scott_henigan@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10308,
                  'personID':206300,
                  'employeeID':0,
                  'fullName':'Sokhoeun Meng',
                  'emailAddress':'sokhoeun.meng@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10309,
                  'personID':153371,
                  'employeeID':0,
                  'fullName':'Thuy Nguyen',
                  'emailAddress':'thuy.nguyen@non.keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10310,
                  'personID':2484,
                  'employeeID':0,
                  'fullName':'Chin Hua',
                  'emailAddress':'toan_hua@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10311,
                  'personID':3874,
                  'employeeID':0,
                  'fullName':'Trang Vu',
                  'emailAddress':'trang_vu@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10312,
                  'personID':18367,
                  'employeeID':0,
                  'fullName':'Warren Y Chan',
                  'emailAddress':'warren_chan@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':10313,
                  'personID':5075,
                  'employeeID':0,
                  'fullName':'Warren Myrick',
                  'emailAddress':'warren_myrick@keysight.com',
                  'supervisorID':30118,
                  'supervisorEmailAddress':'jennifer_foley@keysight.com',
                  'organizationID':77,
                  'organizationName':'Network Analyzers',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         },
         {  
            'uid':7678,
            'personID':222848,
            'employeeID':0,
            'fullName':'Jordan Mee',
            'emailAddress':'jordan.mee@non.keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'organizationID':50,
            'organizationName':'NPI Engineering',
            'level':5,
            'numEmployees':0,
            'showEmployees':false
         },
         {  
            'uid':7679,
            'personID':1371,
            'employeeID':152,
            'fullName':'Nancy Alvarez',
            'emailAddress':'nancy_alvarez@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':28,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':9009,
                  'personID':167822,
                  'employeeID':0,
                  'fullName':'Melvin Johnson',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9010,
                  'personID':167807,
                  'employeeID':0,
                  'fullName':'Ben Goetz',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9011,
                  'personID':217044,
                  'employeeID':0,
                  'fullName':'Belen Alcala',
                  'emailAddress':'belen.alcala@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9012,
                  'personID':47587,
                  'employeeID':0,
                  'fullName':'Dalia Flores',
                  'emailAddress':'dalia_flores@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9013,
                  'personID':20925,
                  'employeeID':0,
                  'fullName':'Darryl Z Kirby',
                  'emailAddress':'darryl_kirby2@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9014,
                  'personID':216767,
                  'employeeID':0,
                  'fullName':'Hamilton Ekbatani',
                  'emailAddress':'hamilton.ekbatani@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9015,
                  'personID':3931,
                  'employeeID':0,
                  'fullName':'Janis Mccarter',
                  'emailAddress':'janis.m.mccarter@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9016,
                  'personID':219377,
                  'employeeID':0,
                  'fullName':'Joe Goren',
                  'emailAddress':'joe.goren@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9017,
                  'personID':223624,
                  'employeeID':0,
                  'fullName':'Jonathan Marshall',
                  'emailAddress':'jonathan.marshall@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9018,
                  'personID':219586,
                  'employeeID':0,
                  'fullName':'Karl Keiser',
                  'emailAddress':'karl.keiser@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9019,
                  'personID':219846,
                  'employeeID':0,
                  'fullName':'Mariah Mellott',
                  'emailAddress':'katie_george@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9020,
                  'personID':219845,
                  'employeeID':0,
                  'fullName':'Taylor Baranzelli',
                  'emailAddress':'katie_george@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9021,
                  'personID':117531,
                  'employeeID':0,
                  'fullName':'Katie George',
                  'emailAddress':'katie_george@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9022,
                  'personID':175934,
                  'employeeID':0,
                  'fullName':'Caesar Zunino',
                  'emailAddress':'katie_George@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9023,
                  'personID':18016,
                  'employeeID':0,
                  'fullName':'Kenneth Chatelain',
                  'emailAddress':'ken.chatelain5@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9024,
                  'personID':191546,
                  'employeeID':0,
                  'fullName':'Lisa Demartini Crawford',
                  'emailAddress':'lisa.demartini@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':10,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':17591,
                        'personID':4468,
                        'employeeID':0,
                        'fullName':'Ana Fernandez',
                        'emailAddress':'ana_fernandez@keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17592,
                        'personID':214343,
                        'employeeID':0,
                        'fullName':'Brett Carver',
                        'emailAddress':'brett.carver@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17593,
                        'personID':219427,
                        'employeeID':0,
                        'fullName':'Dawid Jaworski',
                        'emailAddress':'dawid.jaworski@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17594,
                        'personID':44038,
                        'employeeID':0,
                        'fullName':'Frank Yee',
                        'emailAddress':'frank.yee@keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17595,
                        'personID':206423,
                        'employeeID':0,
                        'fullName':'Kay Tillotson',
                        'emailAddress':'kay.tillotson@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17596,
                        'personID':222062,
                        'employeeID':0,
                        'fullName':'Kent Swisher',
                        'emailAddress':'kent.swisher@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17597,
                        'personID':145503,
                        'employeeID':0,
                        'fullName':'Kiel Ramos',
                        'emailAddress':'kiel_ramos@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17598,
                        'personID':217684,
                        'employeeID':0,
                        'fullName':'Michelle Sund',
                        'emailAddress':'michelle.sund@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17599,
                        'personID':103364,
                        'employeeID':0,
                        'fullName':'Minh Tran',
                        'emailAddress':'minh1_tran@non.keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':17600,
                        'personID':2966,
                        'employeeID':0,
                        'fullName':'William Carlson',
                        'emailAddress':'william_carlson@keysight.com',
                        'supervisorID':191546,
                        'supervisorEmailAddress':'lisa.demartini@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':9025,
                  'personID':212292,
                  'employeeID':0,
                  'fullName':'Mark Anthony Roque',
                  'emailAddress':'mark-anthony.roque@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9026,
                  'personID':13637,
                  'employeeID':0,
                  'fullName':'Mary Hernandez',
                  'emailAddress':'mary.l.hernandez@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9027,
                  'personID':199639,
                  'employeeID':0,
                  'fullName':'Matt Leroy',
                  'emailAddress':'matt.leroy@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9028,
                  'personID':44154,
                  'employeeID':0,
                  'fullName':'Paul Otto',
                  'emailAddress':'paul_otto@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9029,
                  'personID':223268,
                  'employeeID':0,
                  'fullName':'Raul Gomez',
                  'emailAddress':'raul.gomez5@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9030,
                  'personID':214663,
                  'employeeID':0,
                  'fullName':'Rudy Ponce',
                  'emailAddress':'rudy.ponce@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9031,
                  'personID':3909,
                  'employeeID':0,
                  'fullName':'Tedros Fret',
                  'emailAddress':'tedros.a.fret@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9032,
                  'personID':219430,
                  'employeeID':0,
                  'fullName':'Teresa Ramoa',
                  'emailAddress':'teresa.ramoa@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9033,
                  'personID':1091,
                  'employeeID':0,
                  'fullName':'Thomas Coombes',
                  'emailAddress':'thomas.coombes@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9034,
                  'personID':6359,
                  'employeeID':0,
                  'fullName':'Tony Demattei',
                  'emailAddress':'tony_demattei@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':16,
                  'showEmployees':false,
                  'employees':[  
                     {  
                        'uid':15793,
                        'personID':219525,
                        'employeeID':0,
                        'fullName':'Chunlei Li',
                        'emailAddress':'chunlei.li@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15794,
                        'personID':11873,
                        'employeeID':0,
                        'fullName':'Danny Padilla',
                        'emailAddress':'dan.padilla@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15795,
                        'personID':47856,
                        'employeeID':0,
                        'fullName':'Douglas Myles',
                        'emailAddress':'douglas_myles@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15796,
                        'personID':216134,
                        'employeeID':0,
                        'fullName':'Ellie Fridley',
                        'emailAddress':'ellie.fridley@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15797,
                        'personID':188042,
                        'employeeID':0,
                        'fullName':'Eric Stafford',
                        'emailAddress':'eric.stafford@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15798,
                        'personID':2546,
                        'employeeID':0,
                        'fullName':'Freddy Kralka',
                        'emailAddress':'freddy.kralka@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15799,
                        'personID':223536,
                        'employeeID':0,
                        'fullName':'Geraldo Guinto',
                        'emailAddress':'geraldo.guinto@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15800,
                        'personID':4598,
                        'employeeID':0,
                        'fullName':'Irene   V. Calzada-Bickham',
                        'emailAddress':'irene_calzada-bickham@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15801,
                        'personID':219509,
                        'employeeID':0,
                        'fullName':'Nicole Townsend',
                        'emailAddress':'nicole.townsend@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15802,
                        'personID':2530,
                        'employeeID':0,
                        'fullName':'Rose Mello',
                        'emailAddress':'rose_mello@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15803,
                        'personID':8884,
                        'employeeID':0,
                        'fullName':'Scott Glover',
                        'emailAddress':'scott.glover2@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15804,
                        'personID':2849,
                        'employeeID':0,
                        'fullName':'Scott Lundholm',
                        'emailAddress':'scott.lundholm@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15805,
                        'personID':222242,
                        'employeeID':0,
                        'fullName':'Shaun Mcdonough',
                        'emailAddress':'shaun.mcdonough@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15806,
                        'personID':219115,
                        'employeeID':0,
                        'fullName':'Tefaselassie Asgedom',
                        'emailAddress':'tefaselassie.asggedom@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15807,
                        'personID':217623,
                        'employeeID':0,
                        'fullName':'Thanh Nguyen',
                        'emailAddress':'thanh.nguyen8@non.keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     },
                     {  
                        'uid':15808,
                        'personID':44028,
                        'employeeID':0,
                        'fullName':'Tu T Nguyen',
                        'emailAddress':'tu_nguyen@keysight.com',
                        'supervisorID':6359,
                        'supervisorEmailAddress':'tony_demattei@keysight.com',
                        'level':7,
                        'numEmployees':0,
                        'showEmployees':false
                     }
                  ]
               },
               {  
                  'uid':9035,
                  'personID':4389,
                  'employeeID':0,
                  'fullName':'Tu Nguyen',
                  'emailAddress':'tu_v_nguyen@keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9036,
                  'personID':216860,
                  'employeeID':0,
                  'fullName':'Victor Harjak',
                  'emailAddress':'victor.harjak@non.keysight.com',
                  'supervisorID':1371,
                  'supervisorEmailAddress':'nancy_alvarez@keysight.com',
                  'organizationID':78,
                  'organizationName':'D&P COE Modular Solutions, and WDO',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         },
         {  
            'uid':7680,
            'personID':4656,
            'employeeID':160,
            'fullName':'Nitin Aery',
            'emailAddress':'nitin_aery@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':0,
            'showEmployees':false
         },
         {  
            'uid':7681,
            'personID':22519,
            'employeeID':0,
            'fullName':'Rosangela Torres',
            'emailAddress':'rosangela_torres@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'organizationID':50,
            'organizationName':'NPI Engineering',
            'level':5,
            'numEmployees':0,
            'showEmployees':false
         },
         {  
            'uid':7682,
            'personID':11732,
            'employeeID':153,
            'fullName':'Stephanie Cornell',
            'emailAddress':'stephanie_cornell@keysight.com',
            'supervisorID':167759,
            'supervisorEmailAddress':'trevor_buehl@keysight.com',
            'level':5,
            'numEmployees':35,
            'showEmployees':false,
            'employees':[  
               {  
                  'uid':9549,
                  'personID':2290,
                  'employeeID':0,
                  'fullName':'Anh Pham',
                  'emailAddress':'anh.pham@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9550,
                  'personID':3490,
                  'employeeID':0,
                  'fullName':'Craig R. Love',
                  'emailAddress':'clove@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9551,
                  'personID':2380,
                  'employeeID':0,
                  'fullName':'Dianah Kralka',
                  'emailAddress':'dianah_kralka@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9552,
                  'personID':30571,
                  'employeeID':0,
                  'fullName':'Doug Carter',
                  'emailAddress':'douglas_carter@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9553,
                  'personID':29925,
                  'employeeID':0,
                  'fullName':'Eric Housley',
                  'emailAddress':'eric_housley@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9554,
                  'personID':9209,
                  'employeeID':0,
                  'fullName':'Eugenio Curiel',
                  'emailAddress':'eugenio_curiel@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9555,
                  'personID':4515,
                  'employeeID':0,
                  'fullName':'Fil Lowe',
                  'emailAddress':'fil_lowe@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9556,
                  'personID':160739,
                  'employeeID':0,
                  'fullName':'Greg Schutz',
                  'emailAddress':'greg_schutz@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9557,
                  'personID':21136,
                  'employeeID':0,
                  'fullName':'Hee  B. Byun',
                  'emailAddress':'hee_byun@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9558,
                  'personID':3495,
                  'employeeID':0,
                  'fullName':'Huu Ngo',
                  'emailAddress':'huu.ngo@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9559,
                  'personID':219508,
                  'employeeID':0,
                  'fullName':'Irma Bejarano',
                  'emailAddress':'irma.bejarano@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9560,
                  'personID':43889,
                  'employeeID':0,
                  'fullName':'Jamie Hardin',
                  'emailAddress':'jamie_hardin@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9561,
                  'personID':223563,
                  'employeeID':0,
                  'fullName':'Joseph Seymour',
                  'emailAddress':'joe.seymour@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9562,
                  'personID':4562,
                  'employeeID':0,
                  'fullName':'John P Potts',
                  'emailAddress':'john_potts22@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9563,
                  'personID':224085,
                  'employeeID':0,
                  'fullName':'Jon Chhum',
                  'emailAddress':'jonathan.chhum@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9564,
                  'personID':4946,
                  'employeeID':0,
                  'fullName':'Joseph Robinson',
                  'emailAddress':'joseph.robinson6@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9565,
                  'personID':212404,
                  'employeeID':0,
                  'fullName':'Josh Simon',
                  'emailAddress':'josh.simon6@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9566,
                  'personID':3299,
                  'employeeID':0,
                  'fullName':'Justin Miller',
                  'emailAddress':'justin_miller@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9567,
                  'personID':11372,
                  'employeeID':0,
                  'fullName':'Ken Grabenauer',
                  'emailAddress':'ken.grabenauer@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9568,
                  'personID':30096,
                  'employeeID':0,
                  'fullName':'Kenny Widener',
                  'emailAddress':'kenneth_widener@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9569,
                  'personID':11699,
                  'employeeID':10,
                  'fullName':'Mateo Santiago',
                  'emailAddress':'mateo_santiago@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9570,
                  'personID':48952,
                  'employeeID':0,
                  'fullName':'Michael Wilson',
                  'emailAddress':'michael.wilson@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9571,
                  'personID':30565,
                  'employeeID':0,
                  'fullName':'Mike Baldwin',
                  'emailAddress':'michael_baldwin2@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9572,
                  'personID':4364,
                  'employeeID':0,
                  'fullName':'Michael Giancaspro',
                  'emailAddress':'mike_giancaspro@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9573,
                  'personID':2898,
                  'employeeID':0,
                  'fullName':'Mike Reilly',
                  'emailAddress':'mike_reilly@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9574,
                  'personID':2403,
                  'employeeID':0,
                  'fullName':'Mircea Manu',
                  'emailAddress':'mircea.manu@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9575,
                  'personID':216137,
                  'employeeID':0,
                  'fullName':'Nancy Wandrey',
                  'emailAddress':'nancy.wandrey@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9576,
                  'personID':6524,
                  'employeeID':0,
                  'fullName':'Peter Cervantes',
                  'emailAddress':'peter.cervantes@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9577,
                  'personID':11352,
                  'employeeID':0,
                  'fullName':'Robert D. Mills',
                  'emailAddress':'rob_mills@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9578,
                  'personID':152057,
                  'employeeID':0,
                  'fullName':'Roman Cargill',
                  'emailAddress':'roman.cargill@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9579,
                  'personID':11212,
                  'employeeID':0,
                  'fullName':'Steve Breazeale',
                  'emailAddress':'steve_breazeale@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9580,
                  'personID':3814,
                  'employeeID':0,
                  'fullName':'Stephen E Disbrow',
                  'emailAddress':'steve_disbrow@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9581,
                  'personID':222851,
                  'employeeID':0,
                  'fullName':'Terrill Slocum',
                  'emailAddress':'terrill.slocum@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9582,
                  'personID':199512,
                  'employeeID':0,
                  'fullName':'Tess Ramos',
                  'emailAddress':'tess.ramos3@non.keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               },
               {  
                  'uid':9583,
                  'personID':13341,
                  'employeeID':0,
                  'fullName':'Trung Q Tran',
                  'emailAddress':'trung_tran@keysight.com',
                  'supervisorID':11732,
                  'supervisorEmailAddress':'stephanie_cornell@keysight.com',
                  'organizationID':76,
                  'organizationName':'High Frequency Measurements COE',
                  'level':6,
                  'numEmployees':0,
                  'showEmployees':false
               }
            ]
         }
      ]
   }];




  }


  ngOnInit() {

    // console.log('sample nested org data (hard-coded)');
    // console.log(this.nestedOrgData2);


    if (this.cacheService.$nestedOrgData) {
      this.nestedOrgData = this.cacheService.$nestedOrgData;
      this.cacheService.nestedOrgDataCached = true;
      // console.log('nested org data picked up in employee reports');
      // console.log(this.nestedOrgData);
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
          // console.log('nested org data received in employee reports component via subscription');
          // console.log(this.nestedOrgData);
          this.waitingForOrgData = false;
          this.setInitialDropDownEmployee();
          this.cacheService.nestedOrgDataRequested = undefined;
        }
    });

    if (!this.cacheService.nestedOrgDataRequested && !this.cacheService.nestedOrgDataCached) {
      // get logged in user's info
      this.authService.getLoggedInUser((user, err) => {
        this.getNestedOrgData(user.email);
        // this.getNestedOrgData('ron_nersesian@keysight.com');
        // this.getNestedOrgData('pat_harper@keysight.com');
      });
    }

    // show the spinner if the nested org data is not loaded yet
    if (!this.nestedOrgData) {
      this.waitingForOrgData = true;
    }

  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }


  getNestedOrgData(email: string) {
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        // console.log('nested org object retrieved from api data service in employee reports component');
        // console.log(nestedOrgData);
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
        // console.error('error getting nested org data');
        // this.nestedOrgData = JSON.parse('[' + this.nestedOrgData2.json + ']');
        this.nestedOrgData = this.nestedOrgData2;
        // console.log('nested org data:');
        // console.log(this.nestedOrgData);
        // console.log('first object');
        // console.log(this.nestedOrgData[0]);
        this.waitingForOrgData = false;
        this.setInitialDropDownEmployee();
        this.flatOrgData = this.flattenNestedOrgData($.extend(true, {}, this.nestedOrgData));
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


  onclickedEmployee(employee) {
    this.displayOrgDropDown = false;
    this.displayedEmployee = employee;
    // console.log('displayed employee');
    // console.log(this.displayedEmployee);

    this.manager = this.getManager(this.nestedOrgData, employee);
    // console.log('manager:');
    // console.log(this.manager);

    this.managerString = this.manager ? `${this.manager.fullName} (id: ${this.manager.employeeID})` : 'No Manager in Org Structure';

    if (this.manager) {
      this.teamMembersString = this.buildCoworkersString(this.manager);
    } else {
      this.teamMembersString = undefined;
    }

    this.employees = this.getEmployees(this.nestedOrgData, employee);
    // console.log('employees:');
    // console.log(this.employees);

    this.employeesString = this.buildEmployeesString(this.employees);


    this.displayResults = true;

    this.dropDownDisplayedEmployee = employee.fullName;
    this.collapseOrg(this.nestedOrgData);

    // console.log('manager data:');
    // console.log(manager);

    setTimeout(() => {
      // console.log('Employee ' + this.displayedEmployee.employeeID);
      this.getQuarterlyEmployeeFTETotals();
    }, 0);

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


  // TEMP CODE: build string of co-workers for the selected employee
  buildCoworkersString(manager): string {
    const teamArr: string[] = [];
    if (manager.hasOwnProperty('employees')) {
      manager.employees.forEach(employee => {
        teamArr.push(`${employee.fullName} (id: ${employee.employeeID})`);
      });
    }
    return teamArr.join(', ');
  }

  // TEMP CODE: build string of employees for the selected employee
  buildEmployeesString(employees): string {
    const empArr: string[] = [];
    employees.forEach(employee => {
      empArr.push(`${employee.fullName} (id: ${employee.employeeID})`);
    });
    return empArr.length ? empArr.join(', ') : '';
  }

  getQuarterlyEmployeeFTETotals() {

    // Convert current month to fiscal quarter
    const date = new Date();

    if (date.getMonth() === 10 || date.getMonth() === 11 || date.getMonth() === 0) {
      this.currentFiscalQuarter = 1;
    } else if (date.getMonth() === 1 || date.getMonth() === 2 || date.getMonth() === 3) {
      this.currentFiscalQuarter = 2;
    } else if (date.getMonth() === 4 || date.getMonth() === 5 || date.getMonth() === 6) {
      this.currentFiscalQuarter = 3;
    } else if (date.getMonth() === 7 || date.getMonth() === 8 || date.getMonth() === 9) {
      this.currentFiscalQuarter = 4;
    }

    this.currentFiscalYear = date.getFullYear();

    // Retrieve employee FTE aggregate data for a specific quarter and year
    this.apiDataReportService.getQuarterlyEmployeeFTETotals(this.displayedEmployee.employeeID,
      this.currentFiscalQuarter, this.currentFiscalYear)
      .subscribe(
        res => {
          this.quarterlyEmployeeFTETotals = res;
          // console.log('Project FTE List: ',  this.quarterlyEmployeeFTETotals);
          this.employeeProjectChart();
        },
        err => {
          // console.log(err);
        }
      );
  }

  employeeProjectChart() {

    // Employee FTE in Pie Chart
    Highcharts.chart('employeeProjectChart', {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: this.displayedEmployee.fullName + 'Current Quarter FTE'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  // style: {
                  //     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                  // }
              }
          }
      },
      series: [{
          data: this.quarterlyEmployeeFTETotals
      }]
    });

  }

}
