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

		(function loopDirectories(directoriesIndex) {
			//조회된 파일, 폴더 개수만큼 반복
			if(directoriesLength > directoriesIndex) {
				let directory = directories[directoriesIndex],
					directoryName = directory,
					nextDirectoriesIndex = directoriesIndex + 1;
				
				//기본 디렉토리와 폴더명과 합성(./images/#)
				directory = baseDirectory + '/' + directoryName;

				fs.stat(directory, (err, stats) => {
					//오류가 있을 때
					if(err) {
						console.error(directory + '를 조회 할 수 없습니다.');
						
						loopDirectories(nextDirectoriesIndex);

					//폴더일 때
					}else if(stats.isDirectory()) {
						fs.readdir(directory, (err, files) => {
							//오류가 있을 때
							if(err) {
								console.error(directory + ' 목록을 읽을 수 없습니다.');
								
								loopDirectories(nextDirectoriesIndex);
							}else{
								let distDirectory = directory + '/dist';
								
								fs.stat(distDirectory, (err, stats) => {
									//오류가 있을 때
									if(err) {
										fs.mkdir(distDirectory, err => {
											//오류가 있을 때
											if(err) {
												console.error(distDirectory + '에 폴더를 생성하지 못했습니다.');

												loopDirectories(nextDirectoriesIndex);
											}else{
												loopDirectories(directoriesIndex);
											}
										});

									//폴더일 때
									}else if(stats.isDirectory()) {
										let filesLength = files.length;

										(function loopFiles(filesIndex) {
											//파일 개수만큼 반복
											if(filesLength > filesIndex) {
												let file = files[filesIndex],
													fileDirectory = directory + '/' + file,
													fileExtensions = path.extname(file),
													nextFilesIndex = filesIndex + 1,
													saveDirectory = distDirectory + '/' + file;
												
												fs.unlink(saveDirectory, err => {
													//오류가 있을 때
													if(err) {
														//문자일 때
														if(typeof fileExtensions === 'string') {
															fileExtensions = fileExtensions.toLowerCase();
														}

														fs.stat(fileDirectory, (err, stats) => {
															//오류가 있을 때
															if(err) {
																console.error(fileDirectory + '를 조회 할 수 없습니다.');
																
																loopFiles(nextFilesIndex);

															//이미지 파일의 확장자를 가진 파일일 때
															}else if(stats.isFile()) {
																let imageOptimizerOptions = [mozjpeg, ['-outfile', saveDirectory, fileDirectory], err => {
																	//오류가 있을 때
																	if(err) {
																		console.error(fileDirectory + ' 이미지를 최적화 하지 못했습니다.');
																	}else{
																		console.log(fileDirectory + ' 이미지를 최적화 하였습니다.');
																	}

																	loopFiles(nextFilesIndex);
																}];

																//jpeg 또는 jpg일 때
																if(fileExtensions === '.jpeg' || fileExtensions === '.jpg') {
																	execFile.apply(null, imageOptimizerOptions);

																//gif 또는 png일 때
																}else if(fileExtensions === '.gif' || fileExtensions === '.png') {
																	imageOptimizerOptions[0] = optipng;
																	imageOptimizerOptions[1][0] = '-out';

																	execFile.apply(null, imageOptimizerOptions);
																}else{
																	loopFiles(nextFilesIndex);
																}
															}else{
																loopFiles(nextFilesIndex);
															}
														});
													}else{
														loopFiles(filesIndex);
													}
												});
											}else{
												loopDirectories(nextDirectoriesIndex);
											}
										})(0);
									}else{
										console.error(distDirectory + '가 폴더가 아닙니다.');

										loopDirectories(nextDirectoriesIndex);
									}
								});
							}
						});
					}else{
						console.error(directory + '가 폴더가 아닙니다.');

						loopDirectories(nextDirectoriesIndex);
					}
				});
			}else{
				console.log('작업을 완료하였습니다.');
			}
		})(0);
	}
});