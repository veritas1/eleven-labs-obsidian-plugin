import { Vault } from "obsidian";

export function generateFilename(voiceName: string, date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day}_${hour}-${minutes}-${seconds}_${voiceName}`;
}

export function createVaultDirectories(vault: Vault, directories: string[]) {
    directories.forEach((directory) => {
        if (!vault.getAbstractFileByPath(directory)) {
            vault.createFolder(directory);
        }
    });
}
