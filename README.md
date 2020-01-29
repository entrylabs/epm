# epm

Install the npm package wherever you want

## Installation

```sh
$ npm install --global @entrylabs/epm
```

## Usage

```bash
epm install [packages]
```

```bash
Usage: epm [options] [command]

Options:
  -v, --version     output the current version
  -d, --dir <path>  Where to Install the Package (default: "entry_modules")
  -h, --help        output usage information

Commands:
  install           Install the npm package.
  i                 Install the npm package.
```

## Use epackage.json

If the package.json exists in the location where the epm runs, the package corresponding to the package.json is installed.

```json
{
  "directory": "<path>",
  "dependencies": {
    "react": "16.12.0"
  }
}
```

- directory
  - Location of packages to be installed
- dependencies
  - List of packages to install

## License

MIT
