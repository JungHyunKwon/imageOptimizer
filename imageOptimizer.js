/**
 * @names imageOptimizer
 * @author JungHyunKwon
 * @since 2019-02-05
 */

'use strict';

const fs = require('fs'),
	  path = require('path'),
	  {execFile} = require('child_process'),
	  optipng = require('optipng-bin'), // {@link https://github.com/imagemin/optipng-bin}
	  mozjpeg = require('mozjpeg'), // {@link https://github.com/imagemin/mozjpeg-bin}
	  baseDirectory = './images';

fs.readdir(baseDirectory, (err, directories) => {
	//오류가 있을 때
	if(err) {
		console.error(baseDirectory + '가 있는지 확인해주세요.');
	}else{
		let directoriesLength = directories.length;

		(function loopDirectories(index) {
			//조회된 파일, 폴더 개수만큼 반복
			if(directoriesLength > index) {
				let directory = directories[index],
					directoryName = directory,
					nextIndex = index + 1;
				
				//기본 디렉토리와 폴더명과 합성(./images/#)
				directory = baseDirectory + '/' + directoryName;

				fs.stat(directory, (err, stats) => {
					//오류가 있을 때
					if(err) {
						console.error(directory + '를 조회 할 수 없습니다.');
						
						loopDirectories(nextIndex);

					//폴더일 때
					}else if(stats.isDirectory()) {
						fs.readdir(directory, (err, files) => {
							//오류가 있을 때
							if(err) {
								console.error(directory + ' 목록을 읽을 수 없습니다.');
								
								loopDirectories(nextIndex);
							}else{
								let distDirectory = directory + '/dist';
								
								fs.stat(distDirectory, (err, stats) => {
									//오류가 있을 때
									if(err) {
										fs.mkdir(distDirectory, (err) => {
											//오류가 있을 때
											if(err) {
												console.error(distDirectory + '에 폴더를 생성하지 못했습니다.');

												loopDirectories(nextIndex);
											}else{
												loopDirectories(index);
											}
										});

									//폴더일 때
									}else if(stats.isDirectory()) {
										let filesLength = files.length;

										(function loopFiles(index) {
											//파일 개수만큼 반복
											if(filesLength > index) {
												let file = files[index],
													fileDirectory = directory + '/' + file,
													fileExtension = path.extname(file),
													nextIndex = index + 1,
													saveDirectory = distDirectory + '/' + file;
												
												fs.unlink(saveDirectory, (err) => {
													//오류가 있을 때
													if(err) {
														//문자일 때
														if(typeof fileExtension === 'string') {
															fileExtension = fileExtension.toLowerCase();
														}

														fs.stat(fileDirectory, (err, stats) => {
															//오류가 있을 때
															if(err) {
																console.error(fileDirectory + '를 조회 할 수 없습니다.');
																
																loopFiles(nextIndex);

															//이미지 파일의 확장자를 가진 파일일 때
															}else if(stats.isFile()) {
																let imageOptimizerOptions = [mozjpeg, ['-outfile', saveDirectory, fileDirectory], (err) => {
																	//오류가 있을 때
																	if(err) {
																		console.error(fileDirectory + ' 이미지를 최적화 하지 못했습니다.');
																	}else{
																		console.log(fileDirectory + ' 이미지를 최적화 하였습니다.');
																	}

																	loopFiles(nextIndex);
																}];

																//jpeg 또는 jpg일 때
																if(fileExtension === '.jpeg' || fileExtension === '.jpg') {
																	execFile.apply(null, imageOptimizerOptions);

																//gif 또는 png일 때
																}else if(fileExtension === '.gif' || fileExtension === '.png') {
																	imageOptimizerOptions[0] = optipng;
																	imageOptimizerOptions[1][0] = '-out';

																	execFile.apply(null, imageOptimizerOptions);
																}else{
																	loopFiles(nextIndex);
																}
															}else{
																loopFiles(nextIndex);
															}
														});
													}else{
														loopFiles(index);
													}
												});
											}else{
												loopDirectories(nextIndex);
											}
										})(0);
									}else{
										console.error(distDirectory + '가 폴더가 아닙니다.');

										loopDirectories(nextIndex);
									}
								});
							}
						});
					}else{
						console.error(directory + '가 폴더가 아닙니다.');

						loopDirectories(nextIndex);
					}
				});
			}else{
				console.log('작업을 완료하였습니다.');
			}
		})(0);
	}
});