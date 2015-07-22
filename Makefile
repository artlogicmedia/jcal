# Build a minified version of jCal using UglifyJS
#
# Get UglifyJS: https://github.com/mishoo/UglifyJS

UGLIFY = uglifyjs --consolidate-primitive-values --lift-vars
MKDIR_P = mkdir -p
RM = rm -rf
OUT_DIR = build/js/
SHORT_COPYRIGHT = '// jCal v0.1.10 | (c) 2010-2014 Artlogic Media Ltd | Licensed under the GPLv2 or MIT license\n'

all: build/jquery.jcal.min.js

clean:
	${RM} build/*

${OUT_DIR}:
	${MKDIR_P} ${OUT_DIR}

build/jquery.jcal.min.js: ${OUT_DIR}
	${UGLIFY} src/js/jquery.jcal.js >> build/js/jquery.jcal.min.js
	sed -i '' 's/"use strict";//g' build/js/jquery.jcal.min.js
