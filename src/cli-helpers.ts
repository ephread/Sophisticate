/**
 * @fileoverview ARGV parsing helpers.
 * @author Frédéric Maquin <fred@ephread.com>
 */

// ----------------------------------------------------------------------------
// Requirements
// ----------------------------------------------------------------------------

import * as Chalk from "chalk";
import * as FS from "fs";
import * as Yargs from "yargs";

const configDirectory = `${__dirname}/../../config`;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/**
 * parseArgs - Parse the command line arguments using YARGS.
 *
 * @return {Object} parsed arguments
 */
export function parseArgs(): any {
  const argv =
    Yargs.usage("usage: $0 <svg|html|match> -o <output-directory> [<options>] <svg-file> [<svg-file>]…")
         .demandCommand(2, "Not enough argument: must provide either the svg, html or match command.")
         .help()
         .command("svg", "Sophisticate the given SVGs", (yargs) => {
           yargs
             .usage("usage: $0 svg <svg> [<svg2>]... -o <output-directory> [-c <config-file>]")

             .demandCommand(1, "Not enough argument: must provide at least one svg file.")
             .wrap(null);

           configureWithSharedOptions(yargs);
           configureWithProcessOptions(yargs);

           return yargs;
         })
         .command("html", "Sophisticate the given SVGs and generate a HTML file based on the template.", (yargs) => {
           yargs
             .usage("usage: $0 html <svg> [<svg2>]... -o <output-directory> [-c <config-file>] [-t <template>]")

             .alias("t", "template")
             .nargs("t", 1)
             .describe("t", "HTML template to use.")

             .alias("s", "single-file")
             .nargs("s", 0)
             .describe("s", "Merge all given SVG into the same HTML file. The basename of the file can be provided.")

             .demandCommand(1, "Not enough argument: must provide at least one svg file.")
             .wrap(null);

           configureWithSharedOptions(yargs);
           configureWithProcessOptions(yargs);

           return yargs;
         })
         .command("match", "Test the specified configuration file against the given SVG.", (yargs) => {
           yargs
             .usage("usage: $0 match <svg> -c <config-file>")

             .demandCommand(1, "Not enough argument: must provide at least one svg file.")
             .wrap(null);

           configureWithSharedOptions(yargs);
           yargs.demandOption("c", "Configuration file is required");

           return yargs;
         })
         .wrap(null)
         .argv;

  defineDefaults(argv);

  return argv;
}

/**
 * defineDefaults - set default values for each optional arguments
 *
 * @param  {Object} argv YARGS output
 * @return {Object}      updated YARGS output
 */
function defineDefaults(argv: any): any {
  if (argv.o === undefined) {
    argv.o = process.cwd();
  }

  if (argv.c === undefined) {
    const sophisticateFile = `${process.cwd()}/.sophisticate.yml`;

    if (FS.existsSync(sophisticateFile)) {
      argv.c = sophisticateFile;
    } else {
      console.log(`[${Chalk.yellow("WARN")}] no config specified (either from -c or via .sophisticate.yml)`);
    }
  }

  if (argv.t === undefined) {
    if (argv.s) {
      argv.t = `${configDirectory}/default-multi-template.ejs`;
    } else {
      argv.t = `${configDirectory}/default-template.ejs`;
    }
  }

  return argv;
}

/**
 * configureWithProcessOptions - configure options which are shared between 'process' commands.
 *
 * @param  {Object} argv YARGS builder
 * @return {Object}      updated YARGS builder
 */
function configureWithProcessOptions(yargs: any) {
  yargs.alias("o", "output-directory")
       .nargs("o", 1)
       .describe("o", "Directory to which output the processed SVGs")

       .demandOption("o", "Output directory is required.");

  return yargs;
}

/**
 * configureWithSharedOptions - configure options which are shared between commands.
 *
 * @param  {Object} argv YARGS builder
 * @return {Object}      updated YARGS builder
 */
function configureWithSharedOptions(yargs: any) {
  yargs.alias("c", "config-file")
       .nargs("c", 1)
       .describe("c", "Configuration file with sophistication rules.");

  return yargs;
}
