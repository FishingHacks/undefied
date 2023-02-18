(function () {
    const exitError = globalThis.ExitError;

    function SC_exit(int) {
        throw new exitError(int);
    }

    const arr = [SC_exit];
    for (const el of arr) window[el.name] = el;
})();
