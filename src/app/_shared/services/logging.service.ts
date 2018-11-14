import { Injectable } from '@angular/core';
import { ApiDataLogService } from '../../_shared/services/api-data/_index';

@Injectable()
export class LoggingService {

  constructor(
    private apiDataLogService: ApiDataLogService
  ) { }


  writeToLogFile(level: string, message: string, metadata: any) {

    // build a log object to send as the request body
    const log = {
      level: level,
      message: message,
      metadata: metadata
    };

    this.apiDataLogService.writeToLog(log).subscribe(
      res => {
        console.log('response from log data:');
        console.log(res);
      },
      err => {
        console.log('error from log data:');
        console.log(err);
    });


  }

}
