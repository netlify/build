/** Returns the path to the user's local data directory.
 *
 * The returned value depends on the operating system and is either a string,
 * containing a value from the following table, or `null`.
 *
 * | Platform | Value                                    | Example                                      |
 * | -------- | ---------------------------------------- | -------------------------------------------- |
 * | Linux    | `$XDG_DATA_HOME` or `$HOME`/.local/share | /home/justjavac/.local/share                 |
 * | macOS    | `$HOME`/Library/Application Support      | /Users/justjavac/Library/Application Support |
 * | Windows  | `$LOCALAPPDATA`                          | C:\Users\justjavac\AppData\Local             |
 */
export default function dataDir(): string | null {
  switch (Deno.build.os) {
    case "linux": {
      const xdg = Deno.env.get("XDG_DATA_HOME");
      if (xdg) return xdg;

      const home = Deno.env.get("HOME");
      if (home) return `${home}/.local/share`;
      break;
    }

    case "darwin": {
      const home = Deno.env.get("HOME");
      if (home) return `${home}/Library/Application Support`;
      break;
    }

    case "windows":
      return Deno.env.get("LOCALAPPDATA") ?? null;
  }

  return null;
}
