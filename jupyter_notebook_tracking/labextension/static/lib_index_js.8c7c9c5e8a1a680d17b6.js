"use strict";
(self["webpackChunkjupyter_notebook_tracking"] = self["webpackChunkjupyter_notebook_tracking"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_1__);


const TRACKING_KEY = 'tracking';
/**
 * Track editing time for a single notebook panel.
 */
class NotebookEditTimeTracker {
    constructor(panel) {
        this._sessionStartTime = null;
        this._onSaveState = (_, state) => {
            if (state === 'started' && this._sessionStartTime !== null) {
                this._updateEditTime();
            }
        };
        this._panel = panel;
        // Start tracking when the notebook becomes ready
        panel.context.ready.then(() => {
            this._startSession();
        });
        // When notebook is about to save, update the edit time
        panel.context.saveState.connect(this._onSaveState, this);
        // Clean up when panel is disposed
        panel.disposed.connect(() => {
            panel.context.saveState.disconnect(this._onSaveState, this);
        });
    }
    _startSession() {
        this._sessionStartTime = Date.now();
    }
    _updateEditTime() {
        if (this._sessionStartTime === null) {
            return;
        }
        const model = this._panel.context.model;
        if (!model) {
            return;
        }
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this._sessionStartTime) / 1000);
        // Get current tracking metadata, or initialize with defaults
        const metadata = model.sharedModel.metadata;
        const tracking = metadata[TRACKING_KEY] || {
            total_edit_time_seconds: 0,
            editors: {},
            history: []
        };
        // Add elapsed time to total
        tracking.total_edit_time_seconds += elapsedSeconds;
        // Get the current user from JUPYTERHUB_USER (available via hubUser in PageConfig)
        const hubUser = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_1__.PageConfig.getOption('hubUser');
        if (hubUser) {
            // Set last_edit_by
            tracking.last_edit_by = hubUser;
            // Update editors dictionary with per-user edit time
            const userEditTime = tracking.editors[hubUser] || 0;
            tracking.editors[hubUser] = userEditTime + elapsedSeconds;
        }
        // Append a history record
        const notebookContent = JSON.stringify(model.sharedModel.toJSON());
        const byteSize = new TextEncoder().encode(notebookContent).length;
        const historyRecord = {
            timestamp: new Date().toISOString(),
            user: hubUser || 'unknown',
            bytes: byteSize,
            edit_time_seconds: elapsedSeconds
        };
        tracking.history.push(historyRecord);
        // Save the tracking metadata
        model.sharedModel.setMetadata(TRACKING_KEY, tracking);
        // Reset session start time to now (so we track time since last save)
        this._sessionStartTime = now;
    }
}
/**
 * Initialization data for the jupyter_notebook_tracking extension.
 */
const plugin = {
    id: 'jupyter_notebook_tracking:plugin',
    description: 'Track total editing time in Jupyter notebooks',
    autoStart: true,
    requires: [_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__.INotebookTracker],
    activate: (app, notebookTracker) => {
        console.log('JupyterLab extension jupyter_notebook_tracking is activated!');
        // Track edit time for each notebook that is opened
        notebookTracker.widgetAdded.connect((_, panel) => {
            new NotebookEditTimeTracker(panel);
        });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.8c7c9c5e8a1a680d17b6.js.map