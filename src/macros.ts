export const rot =
    '%macro rot 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    pop rcx\n' +
    '    push rax\n' +
    '    push rcx\n' +
    '    push rbx\n' +
    '%endmacro';
export const swap =
    '%macro swap 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    "    push rax\n" +
    '    push rbx\n' +
    '%endmacro';

export const dup =
    '%macro dup 0\n' +
    '    pop rax\n' +
    "    push rax\n" +
    '    push rax\n' +
    '%endmacro';

export const plus =
    '%macro plus 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    add rax, rbx\n' +
    '    push rax\n' +
    '%endmacro';

export const minus =
    '%macro minus 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    sub rbx, rax\n' +
    '    push rbx\n' +
    '%endmacro';

export const multiply =
    '%macro multiply 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    mul rbx\n' +
    '    push rax\n' +
    '%endmacro';

export const divmod =
    '%macro divmod 0\n' +
    '    xor rdx, rdx\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    div rbx\n' +
    '    push rax\n' +
    '    push rdx\n' +
    '%endmacro';

export const print =
    '%macro print 0\n' + '    pop rdi\n' + '    call _print\n' + '%endmacro';

// syscalls

export const syscall1 =
    '%macro syscall1 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const syscall2 =
    '%macro syscall2 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    pop rsi\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const syscall3 =
    '%macro syscall3 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    pop rsi\n' +
    '    pop rdx\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const syscall4 =
    '%macro syscall4 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    pop rsi\n' +
    '    pop rdx\n' +
    '    pop r10\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const syscall5 =
    '%macro syscall5 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    pop rsi\n' +
    '    pop rdx\n' +
    '    pop r10\n' +
    '    pop r8\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const syscall6 =
    '%macro syscall6 0\n' +
    '    pop rax\n' +
    '    pop rdi\n' +
    '    pop rsi\n' +
    '    pop rdx\n' +
    '    pop r10\n' +
    '    pop r8\n' +
    '    pop r9\n' +
    '    syscall\n' +
    '    push rax\n' +
    '%endmacro';

export const drop = '%macro drop 0\n' + '    pop rax\n' + '%endmacro';

export const over =
    '%macro over 0\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    push rax\n' +
    '    push rbx\n' +
    '    push rax\n' +
    '%endmacro';

export const equal =
    '%macro equal 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    cmp rax, rbx\n' +
    '    sete al\n' +
    '    movzx rax, al\n' +
    '    push rax\n' +
    '%endmacro';

export const notequal =
    '%macro notequal 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    cmp rax, rbx\n' +
    '    setne al\n' +
    '    movzx rax, al\n' +
    '    push rax\n' +
    '%endmacro';

export const load8 =
    '%macro load8 0\n' +
    '    pop rax\n' +
    '    xor rbx, rbx\n' +
    '    mov bl, [rax]\n' +
    '    push rbx\n' +
    '%endmacro';

export const store8 =
    '%macro store8 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    mov [rax], bl\n' +
    '%endmacro';

export const load16 =
    '%macro load16 0\n' +
    '    pop rax\n' +
    '    xor rbx, rbx\n' +
    '    mov bx, [rax]\n' +
    '    push rbx\n' +
    '%endmacro';

export const store16 =
    '%macro store16 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    mov [rax], bx\n' +
    '%endmacro';

export const load32 =
    '%macro load32 0\n' +
    '    pop rax\n' +
    '    xor rbx, rbx\n' +
    '    mov ebx, [rax]\n' +
    '    push rbx\n' +
    '%endmacro';

export const store32 =
    '%macro store32 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    mov [rax], ebx\n' +
    '%endmacro';

export const load64 =
    '%macro load64 0\n' +
    '    pop rax\n' +
    '    xor rbx, rbx\n' +
    '    mov rbx, [rax]\n' +
    '    push rbx\n' +
    '%endmacro';

export const store64 =
    '%macro store64 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    mov [rax], rbx\n' +
    '%endmacro';

export const argv =
    '%macro argv 0\n' +
    '    mov rax, [args_ptr]\n' +
    '    add rax, 8\n' +
    '    push rax\n' +
    '%endmacro';

export const cast_int = '%macro cast_int 0\n' + '%endmacro';
export const cast_ptr = '%macro cast_ptr 0\n' + '%endmacro';

export const cast_bool =
    '%macro cast_bool 0\n' +
    '    pop rax\n' +
    '    cmp rax, 0\n' +
    '    setne al\n' +
    '    movzx rax, al\n' +
    '    push rax\n' +
    '%endmacro';

export const fake_int = '%macro fake_int 0\n' + '%endmacro';
export const fake_ptr = '%macro fake_ptr 0\n' + '%endmacro';
export const fake_bool = '%macro fake_bool 0\n' + '%endmacro';
export const fake_any = '%macro fake_any 0\n' + '%endmacro';
export const fake_drop = '%macro fake_drop 0\n' + '%endmacro';

export const lessthan =
    '%macro lessthan 0\n' +
    '    mov rcx, 0\n' +
    '    mov rdx, 1\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    cmp rax, rbx\n' +
    '    cmovl rcx, rdx\n' +
    '    push rcx\n' +
    '%endmacro';

export const lessthanequal =
    '%macro lessthanequal 0\n' +
    '    mov rcx, 0\n' +
    '    mov rdx, 1\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    cmp rax, rbx\n' +
    '    cmovle rcx, rdx\n' +
    '    push rcx\n' +
    '%endmacro';

export const greaterthan =
    '%macro greaterthan 0\n' +
    '    mov rcx, 0\n' +
    '    mov rdx, 1\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    cmp rax, rbx\n' +
    '    cmovg rcx, rdx\n' +
    '    push rcx\n' +
    '%endmacro';

export const greaterthanequal =
    '%macro greaterthanequal 0\n' +
    '    mov rcx, 0\n' +
    '    mov rdx, 1\n' +
    '    pop rbx\n' +
    '    pop rax\n' +
    '    cmp rax, rbx\n' +
    '    cmovge rcx, rdx\n' +
    '    push rcx\n' +
    '%endmacro';

export const shr =
    '%macro shr 0\n' +
    '    pop rcx\n' +
    '    pop rbx\n' +
    '    shr rbx, cl\n' +
    '    push rbx\n' +
    '%endmacro';

export const shl =
    '%macro shl 0\n' +
    '    pop rcx\n' +
    '    pop rbx\n' +
    '    shl rbx, cl\n' +
    '    push rbx\n' +
    '%endmacro';

export const or =
    '%macro or 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    or rbx, rax\n' +
    '    push rbx\n' +
    '%endmacro';

export const and =
    '%macro and 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    and rbx, rax\n' +
    '    push rax\n' +
    '%endmacro';

export const xor =
    '%macro xor 0\n' +
    '    pop rax\n' +
    '    pop rbx\n' +
    '    xor rbx, rax\n' +
    '    push rax\n' +
    '%endmacro';

export const not =
    '%macro not 0\n' +
    '    pop rax\n' +
    '    not rax\n' +
    '    push rax\n' +
    '%endmacro';

export const exec_main_int =
    '%macro exec_main_int 0\n' +
    '    mov rax, rsp\n' +
    '    mov rsp, [ret_stack_rsp]\n' +
    '    call main_1\n' +
    '    mov [ret_stack_rsp], rsp\n' +
    '    mov rsp, rax\n' +
    '    mov rax, 60\n' +
    '    pop rdi\n' +
    '    syscall\n' +
    '%endmacro';

export const exec_main_void =
    '%macro exec_main_void 0\n' +
    '    mov rax, rsp\n' +
    '    mov rsp, [ret_stack_rsp]\n' +
    '    call main_1\n' +
    '    mov [ret_stack_rsp], rsp\n' +
    '    mov rsp, rax\n' +
    '    mov rax, 60\n' +
    '    mov rdi, 0\n' +
    '    syscall\n' +
    '%endmacro';

export const pushint =
    '%macro pushint 1\n' + '    mov rax, %1\n' + '    push rax\n' + '%endmacro';

export const pushstr =
    '%macro pushstr 2\n' +
    '    mov rax, %1\n' +
    '    push rax\n' +
    '    push str_%2\n' +
    '%endmacro';

export const pushcstr =
    '%macro pushcstr 2\n' + '    push str_%1\n' + '%endmacro';

export const pushemptystr =
    '%macro pushemptystr 0\n' + '    push 0\n' + '    push 0\n' + '%endmacro';

export const pushemptycstr =
    '%macro pushemptycstr 0\n' + '    push 0\n' + '%endmacro';

export const pushmem = '%macro pushmem 1\n' + '    push mem_%1\n' + '%endmacro';

export const pushconst =
    '%macro pushconst 1\n' +
    '    mov rax, %1\n' +
    '    push rax\n' +
    '%endmacro';

export const calladdr =
    '%macro calladdr 1\n' +
    '    mov rax, rsp\n' +
    '    mov rsp, [ret_stack_rsp]\n' +
    '    call addr_%1\n' +
    '    mov [ret_stack_rsp], rsp;\n' +
    '    mov rsp, rax\n' +
    '%endmacro';

export const callFn =
    '%macro callFn 1\n' +
    '    mov rax, rsp\n' +
    '    mov rsp, [ret_stack_rsp]\n' +
    '    call %1\n' +
    '    mov [ret_stack_rsp], rsp;\n' +
    '    mov rsp, rax\n' +
    '%endmacro';

export const skipfn = '%macro skipfn 2\n' + '    jmp addr_%1\n' + '%endmacro';

export const prepfn =
    '%macro prepfn 1\n' +
    '    mov [ret_stack_rsp], rsp\n' +
    '    mov rsp, rax\n' +
    '%endmacro';

export const retj =
    '%macro retj 0\n' +
    '    mov rax, rsp\n' +
    '    mov rsp, [ret_stack_rsp]\n' +
    '    ret\n' +
    '%endmacro';

export const end = '%macro end 0\n%endmacro';
export const endj = '%macro endj 1\n' + '    jmp addr_%1\n' + '%endmacro';
export const eelse = '%macro eelse 1\n' + '    jmp addr_%1\n' + '%endmacro';

export const iff =
    '%macro iff 1\n' +
    '    pop rax\n' +
    '    cmp rax, 0\n' +
    '    je addr_%1\n' +
    '%endmacro';

export const ifstar =
    '%macro ifstar 1\n' +
    '    pop rax\n' +
    '    cmp rax, 0\n' +
    '    je addr_%1\n' +
    '%endmacro';

export const whilee =
    '%macro whilee 1\n' +
    '    pop rax\n' +
    '    push rax\n' +
    '    cmp rax, 0\n' +
    '    je addr_%1\n' +
    '%endmacro';
