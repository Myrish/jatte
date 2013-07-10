### VARIABLES ###
version=$(shell cat VERSION)

build_dir=build
debug_dir=build/debug
release_dir=build/release

config_dir=config
src_dir=src
lib_dir=lib

peg=./${build_dir}/node_modules/.bin/pegjs
uglify=./${build_dir}/node_modules/.bin/uglifyjs

debug_dirs= \
	${debug_dir}/lib

debug_lib_files= \
	${debug_dir}/lib/dejavu.strict.js

debug_src_files= \
	${debug_dir}/jatte.start.js \
	${debug_dir}/common.js \
	${debug_dir}/Scope.js \
	${debug_dir}/Node.js \
	${debug_dir}/Macro.js \
	${debug_dir}/TextParser.js \
	${debug_dir}/DOMCompiler.js \
	${debug_dir}/Template.js \
	${debug_dir}/jatte.defaultMacros.js \
	${debug_dir}/jatte.end.js

debug_files= \
	${debug_lib_files} \
	${debug_src_files} \
	${debug_dir}/jatte.js \
	${debug_dir}/index.html

release_dirs= \
	${release_dir}/lib

release_lib_files= \
	${release_dir}/lib/dejavu.min.js

release_files= \
	${release_lib_files} \
	${release_dir}/jatte.js

### TARGETS ###
.PHONY: all build debug release test clean clean-all

all: release

build: debug

debug: node-dependencies debug-dir debug-dirs ${debug_files}
release: debug release-dir release-dirs ${release_files}

test: build run-tests

clean:
	rm -rf ${debug_dir}
	rm -rf ${release_dir}

clean-all:
	rm -rf ${build_dir}

### NODE DEPENDENCIES RULES ###
build-dir:
	mkdir -p ${build_dir}

${build_dir}/package.json: package.json
	cp $^ $@

${build_dir}/node_modules/.installed: ${build_dir}/package.json
	cd ${build_dir} && npm install
	@touch ${build_dir}/node_modules/.installed

node-dependencies: build-dir ${build_dir}/node_modules/.installed

### DEBUG RULES ###
debug-dir:
	mkdir -p ${debug_dir}

debug-dirs:
	@for dir in ${debug_dirs}; do \
		mkdir -p $$dir; \
	done

${debug_dir}/lib/%.js: ${lib_dir}/%.js
	cp $^ $@

${debug_dir}/lib/%.js: ${lib_dir}/%.js
	cp $^ $@

${debug_dir}/%.js: ${src_dir}/%.js
	cp $^ $@

${debug_dir}/TextParser.js: ${src_dir}/TextParser.pegjs
	${peg} -e 'jatte.TextParser' $^ $@
	
${debug_dir}/jatte.js: ${debug_src_files}
	@echo "(function(jatte) {" > $@

	@for file in $^; do \
		echo -en "\n" >> $@; \
		sed -e 's/^/    /' $$file >> $@; \
	done

	@echo -e "\n})(typeof exports === 'undefined' ? this.jatte = {} : exports);" >> $@

${debug_dir}/index.html: ${src_dir}/index.html
	cp $^ $@

### RELEASE RULES ###
release-dir:
	mkdir -p ${release_dir}

release-dirs:
	@for dir in ${release_dirs}; do \
		mkdir -p $$dir; \
	done

${release_dir}/lib/%.js: ${lib_dir}/%.js
	cp $^ $@

${release_dir}/%.js: ${debug_dir}/%.js
	cp $^ $(@:.js=-${version}.js)
	${uglify} $^ -o $(@:.js=-${version}.min.js)

### TEST RULES ###
run-tests:
	karma start ${config_dir}/karma.conf.js --single-run
