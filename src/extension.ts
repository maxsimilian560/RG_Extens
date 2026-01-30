import * as vscode from "vscode";

const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";
const isMac = process.platform === "darwin";
let OS = 0;
if (isWindows) {
  OS = 0;
} else if (isLinux) {
  OS = 1;
} else if (isMac) {
  OS = 2;
} else {
  OS = 3;
}

function showTemporaryMessage(message: string, duration: number) {
  const messageItem = vscode.window.showInformationMessage(message);
  setTimeout(() => {
    if (messageItem) {
      messageItem.then((item) => {
        if (item) {
          vscode.commands.executeCommand("workbench.action.closeMessages");
        }
      });
    }
  }, duration);
}

async function updateIncludePath(rgpath = "") {
  const config = vscode.workspace.getConfiguration("C_Cpp");
  let includePaths = config.get<string[]>("default.includePath") || [];

  if (!rgpath) {
    vscode.window.showErrorMessage("Rinegine path is not configured.");
    return;
  }
  const rineginePath = "${config:rg-extens.rineginePath}";
  let countReady = 0;
  includePaths = includePaths.filter(p => !p.includes("${config:rg-extens.rineginePath}"));
  let paths = [
    rineginePath + "/",
    rineginePath + "/include/" + (OS === 0 ? "win" : OS === 1 ? "linux" : OS === 2 ? "mac" : "") + "/",
    // rineginePath + "/include/" + (OS === 0 ? "win" : OS === 1 ? "linux" : OS === 2 ? "mac" : "") + "/freetype2",
    // rineginePath + "/include/" + (OS === 0 ? "win" : OS === 1 ? "linux" : OS === 2 ? "mac" : "") + "/GLFW",
    // rineginePath + "/include/" + (OS === 0 ? "win" : OS === 1 ? "linux" : OS === 2 ? "mac" : "") + "/stb",
  ];
  for (let i = 0; i < paths.length; i++) {
    if (!includePaths.includes(paths[i])) {
      includePaths.push(paths[i]);
    } else {
      countReady++;
    }
  }

  //for turn on all hints
  let compilerArgs = config.get<string[]>("default.compilerArgs") || [];
  let args = ["-DRG_ALL_MODULS", "-DRG_ADDONS", "-DRG_ALL_ADDONS"];
  for (let i = 0; i < args.length; i++) {
    if (!compilerArgs.includes(args[i])) {
      compilerArgs.push(args[i]);
    }
  }
  await config.update(
    "default.compilerArgs",
    compilerArgs,
    vscode.ConfigurationTarget.Global
  );
  if (countReady == paths.length) {
    return;
  } else if (countReady == 0) {
    vscode.window.showInformationMessage("Все необходимые пути добавлены!");
  } else if (countReady > 0 && countReady < paths.length) {
    vscode.window.showInformationMessage(
      "Было добавлено " +
      (paths.length - countReady) +
      "/" +
      paths.length +
      " путей, остальные уже были добавлены."
    );
  }
  await config.update(
    "default.includePath",
    includePaths,
    vscode.ConfigurationTarget.Global
  );
}

export function activate(context: vscode.ExtensionContext) {
  const rineginePath = vscode.workspace
    .getConfiguration("rg-extens")
    .get<string>("rineginePath");

  if (!rineginePath || !isValidRineginePath(rineginePath)) {
    showRineginePathNotification();
  } else {
    updateIncludePath(rineginePath);
  }

  let setRineginePath = vscode.commands.registerCommand(
    "rg-extens.setRineginePath",
    async () => {
      await promptForRineginePath();
    }
  );

  function runBuildCommand(command: string) {
    const config = vscode.workspace.getConfiguration("rg-extens");
    const focusTerminal = config.get<boolean>("focusTerminalOnBuild", true);
    const openTerminal = config.get<boolean>("openTerminalOnBuild", true);
    const terminalName = "RG Build";
    let rgTerminal = vscode.window.terminals.find(
      (term) => term.name === terminalName
    );
    if (!rgTerminal) {
      rgTerminal = vscode.window.createTerminal(terminalName);
      if (openTerminal) {
        rgTerminal.show(!focusTerminal);
      }
      vscode.window.showInformationMessage(`Терминал ${terminalName} создан.`);
    }
    rgTerminal.sendText(command, true);
    if (openTerminal) {
      rgTerminal.show(!focusTerminal);
    }
  }

  let buildEngine64 = vscode.commands.registerCommand(
    "rg-extens.buildEngine64",
    () => {
      const rineginePath = vscode.workspace
        .getConfiguration()
        .get("rg-extens.rineginePath") as string;
      vscode.commands.executeCommand("workbench.action.files.save");

      if (rineginePath && isValidRineginePath(rineginePath)) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
          let buildCommand = `${rineginePath}/bin/rgcmd`;
          if (OS == 0) buildCommand = `${rineginePath}/bin/rgcmd.exe`;
          else if (OS == 1) buildCommand = `${rineginePath}/bin/rgcmd`;
          else {
            vscode.window.showErrorMessage("OS not supported.");
          }
          const fullCommand = `"${buildCommand}"`;
          runBuildCommand(`${buildCommand}`);
        } else {
          vscode.window.showErrorMessage("Проект не открыт.");
        }
      } else {
        showRineginePathNotification();
      }
    }
  );

  let buildEngine32 = vscode.commands.registerCommand(
    "rg-extens.buildEngine32",
    () => {
      const rineginePath = vscode.workspace
        .getConfiguration()
        .get("rg-extens.rineginePath") as string;
      vscode.commands.executeCommand("workbench.action.files.save");

      if (rineginePath && isValidRineginePath(rineginePath)) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
          let buildCommand = `${rineginePath}/bin/rgcmd32`;
          if (OS == 0) buildCommand = `${rineginePath}/bin/rgcmd32.exe`;
          else if (OS == 1) buildCommand = `${rineginePath}/bin/rgcmd32`;
          else {
            vscode.window.showErrorMessage("OS not supported.");
          }
          runBuildCommand(`${buildCommand}`);
        } else {
          vscode.window.showErrorMessage("Проект не открыт.");
        }
      } else {
        showRineginePathNotification();
      }
    }
  );

  let deleteRinegineVariable = vscode.commands.registerCommand(
    "rg-extens.deleteRinegineVariable",
    async () => {
      try {
        const config = vscode.workspace.getConfiguration("C_Cpp");
        let includePaths = config.get<string[]>("default.includePath") || [];
        includePaths = includePaths.filter(p => !p.includes("${config:rg-extens.rineginePath}"));
        await config.update(
          "default.includePath",
          includePaths,
          vscode.ConfigurationTarget.Global
        );
        await vscode.workspace
          .getConfiguration("rg-extens")
          .update("rineginePath", undefined, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage(
          "Переменная RineginePath успешно сброшена."
        );


      } catch (error) {
        vscode.window.showErrorMessage("Ошибка при сбросе пути Rinegine.");
      }
    }
  );

  context.subscriptions.push(setRineginePath);
  context.subscriptions.push(buildEngine64);
  context.subscriptions.push(buildEngine32);
  context.subscriptions.push(deleteRinegineVariable);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "rgset",
      {
        provideCompletionItems(document, position) {
          const linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);
          const completions: vscode.CompletionItem[] = [];

          if (linePrefix.match(/mode\s*{/)) {
            const modes = [
              "console",
              "other_cmd",
              "utf",
              "createlib",
              "debug",
              "shared",
              "static",
              "asm",
              "clear",
            ];
            modes.forEach((mode) => {
              const item = new vscode.CompletionItem(
                mode,
                vscode.CompletionItemKind.Keyword
              );
              item.detail = `Mode: ${mode}`;
              completions.push(item);
            });
          }

          if (linePrefix.match(/var\s*{/)) {
            const variables = [
              "name",
              "name32",
              "bit",
              "resource",
              "source",
              "run",
              "compilator",
              "compilator32",
              "libs",
              "libs32",
              "include",
              "include32",
              "flags",
              "flags32",
              "link",
              "link32",
              "extension",
            ];
            variables.forEach((variable) => {
              const item = new vscode.CompletionItem(
                `${variable} = `,
                vscode.CompletionItemKind.Variable
              );
              item.detail = `Variable: ${variable}`;
              completions.push(item);
            });
          }

          ["true", "false", "32", "64", "all"].forEach((value) => {
            const item = new vscode.CompletionItem(
              value,
              vscode.CompletionItemKind.Value
            );
            item.detail = `Value: ${value}`;
            completions.push(item);
          });

          const flags = [
            "RINEGINE_FOL",
            "NAME",
            "BIT",
            "SOURCE",
            "NAME32",
            "RESOURCE",
            "RUN",
            "COMPILATOR",
            "COMPILATOR32",
            "LIBS",
            "LIBS32",
            "INCLUDE",
            "INCLUDE32",
            "FLAGS",
            "FLAGS32",
            "LINK",
            "LINK32",
            "COMPILATOR_FOL",
            "COMPILATOR_FOL32",
            "PROJECT_FOL",
          ];
          flags.forEach((flag) => {
            const item = new vscode.CompletionItem(
              `{${flag}}`,
              vscode.CompletionItemKind.Variable
            );
            item.detail = `Flag: ${flag}`;
            completions.push(item);
          });

          return completions;
        },
      },
      " ",
      "\t"
    )
  );
}

function showRineginePathNotification() {
  const message =
    'Путь до Rinegine не определен. Нажмите "Определить", чтобы выбрать путь.';
  vscode.window.showWarningMessage(message, "Определить").then((selection) => {
    if (selection === "Определить") {
      promptForRineginePath();
    }
  });
  updateIncludePath();
}

async function promptForRineginePath() {
  const selectedFolder = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Выберите папку Rinegine",
  });

  if (selectedFolder && selectedFolder[0]) {
    const manualPath = selectedFolder[0].fsPath;

    if (isValidRineginePath(manualPath)) {
      try {
        await vscode.workspace
          .getConfiguration("rg-extens")
          .update(
            "rineginePath",
            manualPath,
            vscode.ConfigurationTarget.Global
          );
        vscode.window.showInformationMessage(
          `Путь до Rinegine сохранен: ${manualPath}`
        );
        updateIncludePath("rineginePath");
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(
            `Ошибка сохранения пути: ${error.message}`
          );
        } else {
          vscode.window.showErrorMessage(
            "Неизвестная ошибка при сохранении пути."
          );
        }
        showRineginePathNotification();
      }
    } else {
      vscode.window.showErrorMessage(
        "Указанный путь неверен. Путь должен указывать на Rinegine."
      );
      showRineginePathNotification();
    }
  } else {
    vscode.window.showErrorMessage(
      "Путь не был указан. Пожалуйста, введите корректный путь."
    );
    showRineginePathNotification();
  }
}

function isValidRineginePath(rineginePath: string): boolean {
  if (isWindows) {
    return (
      rineginePath.endsWith("\\Rinegine") ||
      rineginePath.endsWith("\\Rinegine\\") ||
      rineginePath.endsWith("/Rinegine") ||
      rineginePath.endsWith("/Rinegine/")
    );
  } else if (isLinux) {
    return (
      rineginePath.endsWith("\\Rinegine") ||
      rineginePath.endsWith("\\Rinegine\\") ||
      rineginePath.endsWith("\\\\Rinegine") ||
      rineginePath.endsWith("\\\\Rinegine\\\\") ||
      rineginePath.endsWith("/Rinegine") ||
      rineginePath.endsWith("/Rinegine/")
    );
  } else if (isMac) {
    console.log("Mac is not supported yet");
    vscode.window.showInformationMessage("Mac is not supported yet");
    return false;
  }

  return false;
}

export function deactivate() { }
