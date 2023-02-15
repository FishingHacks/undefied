export default interface UndefiedConfig {
    /**
     * Please specify all files you want to compile.
     * All paths are relative to the
     * .undefiedconfig.json file's folder
     *
     * @since 1.1.0
     */
    files: string[];
    /**
     * The optimization level.
     *
     * @since 1.1.0
     * @default 1|'1'
     */
    optimizations?: 0 | 1 | '0' | '1';
    /**
     * Disable Typechecking.
     *
     * **Note**: This will make all `???` intrinsics useless.
     * @since 1.1.0
     * @default false
     */
    disableTypechecking?: boolean;
    /**
     * Whether or not to keep the .o and .asm files
     *
     * @since 1.1.0
     * @default false
     */
    keep?: boolean;
    /**
     * The target to compile to
     *
     * @since 1.1.0
     * @default 'linux'
     */
    target?: 'linux' | 'linux-macro';
    /**
     * Whether or not to enable dev mode
     *
     * @since 1.1.0
     * @default false
     */
    devMode?: boolean;
    /**
     * All external .asm files to include.
     *
     * @since 1.1.0
     * @default []
     */
    include?: string[];
    /**
     * Link undefied libs.
     *
     * This will act as if
     * every file has at the top an include
     * for every of these libraries.
     *
     * @since 1.1.0
     * @default []
     */
    libs?: string[];
    /**
     * Disable parameter `__run_function__`
     *
     * @since 1.0.0
     * @default false
     */
    dontRunFunctions?: boolean;
    /**
     * All Global Predefined constants.
     * 
     * @since 1.0.0
     * @default {}
     */
    globalPredefConsts?: Record<string, number>;
}