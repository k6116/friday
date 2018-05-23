
import {by, element, browser} from 'protractor';

describe('jarvis-rt App', () => {
  browser.ignoreSynchronization = true;
  browser.get('/test');

  // Check Correct Page
  it('should have a title of Performance Load Testing', () => {
    const title = element(by.tagName('h4')).getText();
    expect(title).toEqual('Performance Load Testing');
  });

  // Check Default Cycle Value and Reset
    it('Should Have Default Cycle Value', () => {
    this.defaultCycles = element(by.exactBinding('cycles'));

    this.cyclesShouldHaveText = function(value) {
        expect(this.defaultCycles.getText()).toBe(value);
    };
  });


    // Click on Start Button
    this.startButton = element(by.buttonText('Start'));
      this.clickStartButton = function() {
          this.startButton.click();
      };
      this.clickStartButton();


    // Check Cycle Duration
    it('Return Cycle Duration', () => {
      this.completedCycles = element(by.exactBinding('completedCycles'));

      this.completedCyclesShouldHaveText = function(value) {
          expect(this.completedCycles.getText()).toBe(value);
      };
    });


    // Continuous Start
    for (let i = 0; i <= 20; i++) {
       // Click on Start Button
        this.startButton = element(by.buttonText('Start'));
        this.clickStartButton = function() {
            this.startButton.click();
        };
        this.clickStartButton();
    }

});
