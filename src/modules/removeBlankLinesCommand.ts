import * as vscode from "vscode";
import { NO_ACTIVE_EDITOR } from "../consts";
import { getSelectionLines, getSelectionsOrFullDocument, replaceSelectionsWithLines } from "../helpers/vsCodeHelpers";

interface IRemoveBlankLinesCommandOptions {
	onlySurplus: boolean;
}

export async function runRemoveBlankLinesCommand(options: IRemoveBlankLinesCommandOptions) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage(NO_ACTIVE_EDITOR);
		return;
	}

	const matchingLinesBySelection: string[][] = [];
	const selections = getSelectionsOrFullDocument(editor);

	for (const selection of selections) {
		matchingLinesBySelection.push([]);

		let previousIsBlank: boolean = false;
		for (const lineContent of getSelectionLines(editor, selection)) {
			if (lineContent || (!lineContent && !previousIsBlank && options.onlySurplus)) {
				matchingLinesBySelection[matchingLinesBySelection.length - 1].push(lineContent);
			}

			previousIsBlank = !lineContent;
		}
	}

	await replaceSelectionsWithLines(editor, selections, matchingLinesBySelection, false);
}
