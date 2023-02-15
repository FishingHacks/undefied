/**
 * @type {require('./src/config.ts').default}
 */
module.exports = {
    files: ['code/test.undefied', 'code/server.undefied'],
    /* The files to compile. All paths are relative to the .undefiedconfig.json file's folder. */

    // optimizations: '0',
    /* The optimization level. (0|'0'|1|'1') */

    // disableTypechecking: false,
    /* Disables Typechecking. This will make all `???` intrinsics useless. */

    // keep: true,
    /* Set to true to keep the .o and .asm files *

    // target: 'linux' | 'linux-macro',
    /* The target to compile to. Allowed Targets: 'linux'|'linux-macro'. Run undefied -h in case this list is out of date. */

    // devMode: true,
    /* Enable the dev mode */

    // include: [],
    /* A list of all external .asm files to include, relative to the .undefied file */

    libs: ['/home/fishi/js/undefied/code/a'],
    /* A list of all libs to include. This will act like as if there's a include for these libraries at the top of every file. These libs will get loaded before anything else. */
    
    // dontRunFunctions: true,
    /* Disable parameter `__run_function__` */
    
    // globalPredefConsts: {},
    /* all global predefined constants. */
};
