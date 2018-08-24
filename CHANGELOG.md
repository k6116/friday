<a name="1.8.2"></a>
## [1.8.2](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.8.1...v1.8.2) (2018-08-24)


### Bug Fixes

* added SIGINT code to server.js ([0519110](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/0519110))



<a name="1.8.1"></a>
## [1.8.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.8.0...v1.8.1) (2018-08-22)


### Bug Fixes

* **authService:** updated token to store user manager email address ([9eb3a10](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/9eb3a10))
* **projects-create-modal:** added validators to projectname ([efbe7c5](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/efbe7c5))
* **projects-modal:** updated infinite scroll settings from 100 to 50 ([9efce3f](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/9efce3f))



<a name="1.8.0"></a>
# [1.8.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.7.2...v1.8.0) (2018-08-20)


### Features

* **Project Search:** added projects search page ([ce77080](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/ce77080))



<a name="1.7.2"></a>
## [1.7.2](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.7.1...v1.7.2) (2018-08-17)


### Bug Fixes

* **emailController:** updated to reflect cancelled (rescinded) requests ([2e8bf52](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/2e8bf52))
* **projects-modal:** disabled request button after request is made so user cannot send mutliple requ ([782bbd7](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/782bbd7))
* **projects-modal:** fixed async issue with request permissions ([3ae769e](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/3ae769e))
* **projects-modal:** fixed request access button not changing ([4715deb](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/4715deb))
* **projects-modal:** updated confirm modal messages and button text ([78e11f1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/78e11f1))



<a name="1.7.1"></a>
## [1.7.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.7.0...v1.7.1) (2018-08-13)


### Bug Fixes

* **FTE Entry Page:** fixed problem where users could type dots into FTE entry boxes, causing saving ([d46cb46](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/d46cb46))



<a name="1.7.0"></a>
# [1.7.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.6.1...v1.7.0) (2018-08-13)


### Bug Fixes

* **bug fix:** bug fix ([1b0bdae](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/1b0bdae))
* **bug fix (see PR notes):** bug fix ([f3f8df8](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/f3f8df8))
* **bug fixes:** bug fixes ([398e71c](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/398e71c))


### Features

* **Implemented Setups for Parts and Projects:** CRUD on Parts and Projects in Setups ([99575dc](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/99575dc))



<a name="1.6.1"></a>
## [1.6.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.6.0...v1.6.1) (2018-08-10)


### Bug Fixes

* **Auth:** adding security guards to FTE component to prevent unauthorized FTE submissions ([fadcefa](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/fadcefa))
* **FTE Entry page:** improved toast css ([12248ff](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/12248ff))



<a name="1.6.0"></a>
# [1.6.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.5.1...v1.6.0) (2018-08-06)


### Features

* **fte-entry component adn projects-modal component:** remember user-chosen filters after modal is ([105ca0e](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/105ca0e))
* **projects-modal:** Added project details ([9152125](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/9152125))
* **projects-modal and projects-filter pipe:** Filtering with checkboxes using projects-filter pipe ([fc59380](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/fc59380))
* **projects-modal component:** add search by description feature ([60c6be7](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/60c6be7))



<a name="1.5.1"></a>
## [1.5.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.5.0...v1.5.1) (2018-08-06)


### Bug Fixes

* **FTE Component:** when user adds a project that's already in their FTE table (but hidden), show th ([ce788d8](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/ce788d8))
* **FTE Input page:** changed inputs to be whole numbers instead of decimals, displaying a percent si ([36bb300](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/36bb300))
* **Toast component:** moved toasts to more visible location, switched to bootstrap colors, and made ([f83ec6e](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/f83ec6e))
* **Toast component:** toasts are now dismissable, and error toasts require dismissal ([e1a5f22](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/e1a5f22))



<a name="1.5.0"></a>
# [1.5.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.4.1...v1.5.0) (2018-08-02)


### Features

* **supply-demand-component:** Added an experimental supply demand feature ([81a8635](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/81a8635))
* **supply-demand-component:** added supply demand charts for NCI Projects ([a0c0659](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/a0c0659))



<a name="1.4.1"></a>
## [1.4.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.4.0...v1.4.1) (2018-07-26)


### Bug Fixes

* **app-routing.module.ts:** fixed dashboard stuck on loading ([20bdd16](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/20bdd16))



<a name="1.4.0"></a>
# [1.4.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.3.1...v1.4.0) (2018-07-25)


### Features

* **team-fte-summary component:** Added org dropdown ([38358cc](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/38358cc))



<a name="1.3.1"></a>
## [1.3.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.3.0...v1.3.1) (2018-07-24)


### Bug Fixes

* **projects-component:** BETA fixes ([cf53e14](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/cf53e14))



<a name="1.3.0"></a>
# [1.3.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.2.1...v1.3.0) (2018-07-23)


### Features

* **projects-modal component:** add my team's projects filter ([3bc5f62](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/3bc5f62))



<a name="1.2.1"></a>
## [1.2.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.2.0...v1.2.1) (2018-07-19)


### Bug Fixes

* **FTE Entry Page:** users can now highlight and overtype a portion of their FTE entry (previously r ([512c753](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/512c753))
* **Sitewide:** allowing usage of Firefox and Edge browsers ([ae1a7bb](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/ae1a7bb))



<a name="1.2.0"></a>
# [1.2.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.1.0...v1.2.0) (2018-07-19)


### Features

* **fte-entry:** added create button ([b9f3701](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/b9f3701))



<a name="1.1.0"></a>
# [1.1.0](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.0.1...v1.1.0) (2018-07-18)


### Bug Fixes

* **admin and job-titles component:** declared ng-Model variables for production build ([f4b967b](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/f4b967b))


### Features

* **job-titles component:** page to update jobTitles and subTitles ([be95dae](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/be95dae))



<a name="1.0.1"></a>
## [1.0.1](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/compare/v1.0.0...v1.0.1) (2018-07-16)


### Bug Fixes

* **fte-component:** fixed colors of FTE toolbar buttons and trash icon to match bootstrap4 secondary ([cd5165d](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/cd5165d))
* **fte-component:** removed reset button ([fa5a1fa](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/fa5a1fa))
* **fte-component:** reset introjs state using onskip callback to prevent tutorial from continuing if ([d416b68](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/d416b68))
* **projects-modal-component:** recovered lost introJS code from a previous merge for FTE Entry tutor ([e06b703](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/e06b703))



<a name="1.0.0"></a>
# 1.0.0 (2018-07-12)


### Features

* **all:** adding semantic versioning and commitizen to release process ([97c464b](http://bitbucket.it.keysight.com:7999/jrvs/jarvis-resources/commits/97c464b))



