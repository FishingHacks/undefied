#! /bin/sh

tsc src/*.ts src/*/*.ts bin/*.ts --esModuleInterop --module CommonJS --forceConsistentCasingInFileNames --strict --skipLibCheck --resolveJsonModule --target ESNext
# tsc src/compilers/interpreter/index.ts --esModuleInterop --module None --forceConsistentCasingInFileNames --strict --skipLibCheck
