﻿module JustinCredible.SampleApp.Controllers {

    export interface ILogEntryController {
        viewModel: ViewModels.LogEntryViewModel;
    }

    export interface ILogEntryStateParams {
        id: string;
    }

    export class LogEntryController extends BaseController<ViewModels.LogEntryViewModel> implements ILogEntryController {

        public static $inject = ["$scope", "$stateParams", "Logger"];

        private Logger: Services.Logger;
        private $stateParams: ILogEntryStateParams;

        private _fullLogEntry: Models.LogEntry;

        constructor($scope: ng.IScope, $stateParams: ILogEntryStateParams, Logger: Services.Logger) {
            super($scope, ViewModels.LogEntryViewModel);

            this.$stateParams = $stateParams;
            this.Logger = Logger;

            this.setupViewModel();
        }

        //#region Private Helper Methods

        private setupViewModel() {
            this.Logger.getLog(this.$stateParams.id).then(_.bind(this.getLogEntry_success, this));
        }

        private getLogEntry_success(logEntry: Models.LogEntry): void {
            var formattedDate: string;

            // First, save off the entire log entry so it is available if the user attempts
            // to use the copy or email functionality.
            this._fullLogEntry = logEntry;

            // Now use the actual log entry to create the view model.
            this.viewModel.id = logEntry.id;
            this.viewModel.message = logEntry.message;
            this.viewModel.lineNumber = logEntry.lineNumber;
            this.viewModel.colNumber = logEntry.colNumber;
            this.viewModel.uri = logEntry.uri;
            this.viewModel.error = logEntry.error;
            this.viewModel.httpBody = logEntry.httpBody;
            this.viewModel.httpHeaders = logEntry.httpHeaders;
            this.viewModel.httpStatus = logEntry.httpStatus;
            this.viewModel.httpStatusText = logEntry.httpStatusText;
            this.viewModel.httpUrl = logEntry.httpUrl;

            // Format the date and time for display.
            this.viewModel.time = moment(logEntry.timestamp).format("h:mm:ss a");
            this.viewModel.date = formattedDate = moment(logEntry.timestamp).format("l");

            if (logEntry.error == null) {
                // If an error object isn't present, then this is likely one of the
                // unhandled JS exceptions (eg window.onerror).
                this.viewModel.iconType = "alert";
            }
            else {
                // If an error object is present then this error either came from Angular
                // or it was a manually logged error object.
                this.viewModel.iconType = "alert-circled";
            }

            // If this error has HTTP data, then it came from a RESTful API request.
            if (logEntry.httpUrl) {
                this.viewModel.iconType = "android-wifi";
            }
        }

        //#endregion

        //#region Controller Methods

        public copy(): void {
            cordova.plugins.clipboard.copy(JSON.stringify(this._fullLogEntry), () => {
                window.plugins.toast.showShortBottom("Log copied to clipboard!");
            }, null);
        }

        public email(): void {
            window.plugins.toast.showShortBottom("E-mail not currently implemented.");
        }

        //#endregion
    }
}