describe("Jira", function () {

    var testProjectName = 'Demo';

    var testIssueName = 'Issue-qweasdzxc for Demo';
    var testIssueSearchUrl = 'https://jira.atlassian.com/projects/DEMO/issues?filter=reportedbyme';
    var testIssueUrl = '';

    var testIssueSubtaskName = 'Issue-qweasdzxc-subtask for Demo';
    var testIssueSubtaskUrl = '';

    var testFilterName = 'Filter-qweasdzxc for Demo';
    var testFilterSearchUrl = 'https://jira.atlassian.com/secure/ManageFilters.jspa#filterView=my';

    var testBoardSearchUrl = 'https://jira.atlassian.com/secure/ManageRapidViews.jspa';

    var testKanbanBoardName = 'Board-Kanban-qweasdzxc for Demo';
    var testKanbanBoardUrl = '';

    before(function () {

        var testIssueAnchorSelector = '//a[span[contains(@class,"issue-link-summary")][text()="' + testIssueName + '"]]';
        var testIssueSubtaskAnchorSelector = '//a[contains(@class,"issue-link")][text()="' + testIssueSubtaskName + '"]';
        var testKanbanBoardAnchorSelector = '//a[text()="' + testKanbanBoardName + '"]';

        function createIssue() {
            return browser
                .url(testIssueSearchUrl)
                .waitForClick('#create_link')
                .waitForVisible('#create-issue-submit')
                .setValue('#summary', testIssueName)
                .click('#create-issue-submit')
                .waitForExist('#create-issue-dialog', 30000, true)
                .url(testIssueSearchUrl)
                .waitForVisible(testIssueAnchorSelector)
                .getAttribute(testIssueAnchorSelector, 'href')
                .then(function (result) {
                    testIssueUrl = result;
                });
        }

        function createIssueSubtask() {
            return browser
                .then(function () {
                    return browser.url(testIssueUrl);
                })
                .waitForClick('#opsbar-operations_more')
                .waitForClick('#create-subtask')
                .waitForVisible('#create-issue-submit')
                .setValue('#summary', testIssueSubtaskName)
                .click('#create-issue-submit')
                .waitForExist('#create-subtask-dialog', 30000, true)
                .url(testIssueSearchUrl)
                .waitForVisible(testIssueSubtaskAnchorSelector)
                .getAttribute(testIssueSubtaskAnchorSelector, 'href')
                .then(function (result) {
                    testIssueSubtaskUrl = result;
                });
        }

        function createFilter() {
            return browser
                .url(testIssueSearchUrl)
                .waitForClick('#full-issue-navigator a')
                .waitForClick('.save-as-new-filter')
                .waitForVisible('#filterName')
                .setValue('#filterName', testFilterName)
                .click('.submit')
                .waitForVisible('.search-title=' + testFilterName);
        }

        function createKanbanBoard() {
            return browser
                .url(testBoardSearchUrl)
                .waitForClick('#ghx-create-boards-btn')
                .waitForClick('#ghx-wizard-methodology-kanban')
                .waitForClick('#ghx-wizard-method-existing-filter')
                .click('.js-wizard-button-next')
                .waitForVisible('#ghx-wizard-filter-view-name')
                .setValue('#ghx-wizard-filter-view-name', testKanbanBoardName)
                .setValue('#ghx-wizard-filter-select-field', testFilterName)
                .waitForVisible('//div[label[text()="Saved filter"]]//input[@aria-expanded="true"]')
                .keys('\uE007')
                .waitForClick('//button[contains(@class,"js-wizard-button-complete")][@aria-disabled="false"]')
                .waitForExist('//div[contains(@class,"project-title")]/a[text()="' + testProjectName + '"]')
                .getAttribute('//a[contains(@data-link-id,"project-sidebar-work-kanban")]', 'href')
                .then(function (result) {
                    testKanbanBoardUrl = result;
                });
        }

        return browser
            .switchToTaskTrackerWindow()
            .login("Jira")
            // check test issue
            .url(testIssueSearchUrl)
            .waitForVisible('.details-layout')
            .isVisible('empty-results')
            .then(function (result) {
                return result ?
                    createIssue() :
                    browser
                        .waitForVisible('.issue-list')
                        .isExisting(testIssueAnchorSelector)
                        .then(function (result) {
                            return result ?
                                browser
                                    .getAttribute(testIssueAnchorSelector, 'href')
                                    .then(function (result) {
                                        testIssueUrl = result;
                                    }) :
                                createIssue();
                        });
            })
            .then(function () {
                expect(testIssueUrl).to.be.a('string').and.not.to.be.empty;
            })
            // check test issue subtask
            .then(function () {
                return browser.url(testIssueUrl);
            })
            .waitForVisible('#opsbar-operations_more')
            .isExisting(testIssueSubtaskAnchorSelector)
            .then(function (result) {
                return result ?
                    browser
                        .getAttribute(testIssueSubtaskAnchorSelector, 'href')
                        .then(function (result) {
                            testIssueSubtaskUrl = result;
                        }) :
                    createIssueSubtask();
            })
            .then(function () {
                expect(testIssueSubtaskUrl).to.be.a('string').and.not.to.be.empty;
            })
            // check test filter
            .url(testFilterSearchUrl)
            .waitForVisible('#mf_owned')
            .isExisting('//a[text()="' + testFilterName + '"]')
            .then(function (result) {
                if (!result) {
                    return createFilter();
                }
            })
            // check test kanban board
            .url(testBoardSearchUrl)
            .waitForClick('a[data-item-id="all"]')
            .waitForVisible('.js-search-boards-input')
            .setValue('.js-search-boards-input', testKanbanBoardName)
            .waitForRerender('#boards-table table')
            .isExisting('//a[text()="' + testKanbanBoardName + '"]')
            .then(function (result) {
                return result ?
                    browser
                        .getAttribute(testKanbanBoardAnchorSelector, 'href')
                        .then(function (result) {
                            testKanbanBoardUrl = result;
                        }) :
                    createKanbanBoard();
            })
            .then(function () {
                expect(testKanbanBoardUrl).to.be.a('string').and.not.to.be.empty;
            })
    });

    it("can start timer on an issue", function () {
        return browser
            .url(testIssueUrl)
            .waitForVisible('.devart-timer-link')
            .getText('#project-name-val').should.eventually.be.equal(testProjectName)
            .getText('#summary-val').should.eventually.be.equal(testIssueName)
            .url().should.eventually.has.property('value', testIssueUrl)
            .startAndTestTaskStarted(testProjectName, testIssueName, testIssueUrl);
    });

    it("can stop timer on an issue", function () {
        return browser
            .url(testIssueUrl)
            .startStopAndTestTaskStopped();
    });

    it("can start timer on an issue subtask", function () {
        return browser
            .url(testIssueSubtaskUrl)
            .waitForVisible('.devart-timer-link')
            .getText('#project-name-val').should.eventually.be.equal(testProjectName)
            .getText('#summary-val').should.eventually.be.equal(testIssueSubtaskName)
            .url().should.eventually.has.property('value', testIssueSubtaskUrl)
            .startAndTestTaskStarted(testProjectName, testIssueSubtaskName, testIssueSubtaskUrl);
    });

    it("can stop timer on an issue subtask", function () {
        return browser
            .url(testIssueSubtaskUrl)
            .startStopAndTestTaskStopped();
    });

    it("can start timer on an issue from kanban board", function () {
        return browser
            .url(testKanbanBoardUrl)
            .waitForClick('.ghx-inner=' + testIssueName)
            .waitForVisible('.ghx-detail-view-blanket', 5000, true)
            .waitForVisible('.devart-timer-link.devart-timer-link-start')
            .getText('.ghx-project').should.eventually.be.equal(testProjectName)
            .getText('dd[data-field-id=summary]').should.eventually.be.equal(testIssueName)
            .getAttribute('dd[data-field-id=issuekey] > a', 'href').should.eventually.be.equal(testIssueUrl)
            .startAndTestTaskStarted(testProjectName, testIssueName, testIssueUrl);
    });

    it("can stop timer on an issue from kanban board", function () {
        return browser
            .url(testKanbanBoardUrl)
            .waitForClick('.ghx-inner=' + testIssueName)
            .waitForVisible('.ghx-detail-view-blanket', 5000, true)
            .pause(1000) // give some time for mutation observer
            .startStopAndTestTaskStopped();
    });

});