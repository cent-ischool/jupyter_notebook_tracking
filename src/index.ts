import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { PageConfig } from '@jupyterlab/coreutils';

const TOTAL_EDIT_TIME_KEY = 'total_edit_time_seconds';
const LAST_EDIT_BY_KEY = 'last_edit_by';
const EDITORS_KEY = 'editors';

/**
 * Track editing time for a single notebook panel.
 */
class NotebookEditTimeTracker {
  private _panel: NotebookPanel;
  private _sessionStartTime: number | null = null;

  constructor(panel: NotebookPanel) {
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

  private _startSession(): void {
    this._sessionStartTime = Date.now();
  }

  private _onSaveState = (
    _: any,
    state: 'started' | 'completed' | 'failed'
  ): void => {
    if (state === 'started' && this._sessionStartTime !== null) {
      this._updateEditTime();
    }
  };

  private _updateEditTime(): void {
    if (this._sessionStartTime === null) {
      return;
    }

    const model = this._panel.context.model;
    if (!model) {
      return;
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this._sessionStartTime) / 1000);

    // Get current edit time from metadata, default to 0
    const metadata = model.sharedModel.metadata;
    const currentTotalEditTime = (metadata[TOTAL_EDIT_TIME_KEY] as number) || 0;

    // Add elapsed time to total
    const newTotalEditTime = currentTotalEditTime + elapsedSeconds;

    // Update total edit time metadata
    model.sharedModel.setMetadata(TOTAL_EDIT_TIME_KEY, newTotalEditTime);

    // Get the current user from JUPYTERHUB_USER (available via hubUser in PageConfig)
    const hubUser = PageConfig.getOption('hubUser');
    if (hubUser) {
      // Set last_edit_by
      model.sharedModel.setMetadata(LAST_EDIT_BY_KEY, hubUser);

      // Update editors dictionary with per-user edit time
      const editors = (metadata[EDITORS_KEY] as Record<string, number>) || {};
      const userEditTime = editors[hubUser] || 0;
      editors[hubUser] = userEditTime + elapsedSeconds;
      model.sharedModel.setMetadata(EDITORS_KEY, editors);
    }

    // Reset session start time to now (so we track time since last save)
    this._sessionStartTime = now;
  }
}

/**
 * Initialization data for the jupyterlab_notebook_edit_time extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_notebook_edit_time:plugin',
  description: 'Track total editing time in Jupyter notebooks',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    console.log(
      'JupyterLab extension jupyterlab_notebook_edit_time is activated!'
    );

    // Track edit time for each notebook that is opened
    notebookTracker.widgetAdded.connect((_, panel: NotebookPanel) => {
      new NotebookEditTimeTracker(panel);
    });
  }
};

export default plugin;
