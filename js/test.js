app.controller('RoomsIndexCtrl', ['$scope', '$filter', '$http', '$modal', '$timeout', function($scope, $filter, $http, $modal, $timeout) {
  $scope.shareForm = {};
  $scope.statuses = [{
      'text': '[]全部状态',
      'value': ''
  }, {
      'text': '[-1]禁播',
      'value': '-1'
  }, {
      'text': '[0]休息',
      'value': '0'
  }, {
      'text': '[1]准备中',
      'value': '1'
  }, {
      'text': '[2]录播',
      'value': '2'
  }, {
      'text': '[3]重播',
      'value': '3'
  }, {
      'text': '[4]直播',
      'value': '4'
  }];
  $scope.statuses1 = [{
      'text': '[0]休息',
      'value': '0'
  }, {
      'text': '[1]准备中',
      'value': '1'
  }, {
      'text': '[2]录播',
      'value': '2'
  }, {
      'text': '[3]重播',
      'value': '3'
  }, {
      'text': '[4]直播',
      'value': '4'
  }];
  $scope.weights = [{
      'text': '1',
      'value': '1'
  }, {
      'text': '2',
      'value': '2'
  }, {
      'text': '3',
      'value': '3'
  }, {
      'text': '4',
      'value': '4'
  }];
  $scope.status = {
      'selected': {}
  };
  $scope.showStatus = function(val) {
      var selected = [];
      if (val !== undefined) {
          selected = $filter('filter')($scope.statuses, {
              value: val
          });
      }
      return selected.length ? (selected[0].text) : '没有对应状态';
  };

  $scope.sortId = '';
  $scope.sortOnline = '';
  $scope.paginationForm = {
      roomsCurrentPage: 1,
      roomsNumPages: 0,
      roomsTotalCount: 0
  };
  $scope.status = {
      'selected': $scope.statuses[0]
  };
  $scope.asyncListLoading = true;
  $scope.getRoomListSource = function() {
      var postData = {
          'search': $('#txt_search').val(),
          'sortId': $scope.sortId,
          'sortOnline': $scope.sortOnline,
          'page': $scope.paginationForm.roomsCurrentPage,
          'status': $scope.status.selected.value
      };

      $http.post('/proxy/room.list', postData).success(function(data) {
          $scope.asyncListLoading = false;
          if (data.code == 0) {
              $scope.list = data.data.roomList;
              $scope.listPage = data.data.pagination;
              $scope.paginationForm.roomsCurrentPage = $scope.listPage.page;
              $scope.paginationForm.roomsNumPages = $scope.listPage.pageTotal;
              $scope.paginationForm.roomsTotalCount = $scope.listPage.total;
          } else {
              alert(data.message);
          }
      });
  };

  $scope.searchEnter = function(ev) {
      if (ev.keyCode == 13) {
          $scope.sortList('search');
      }
  };
  $scope.sortList = function(sortParam) {
      if (!(sortParam == 'search' || sortParam == 'status')) {
          if ($scope[sortParam] == '') {
              $scope[sortParam] = 'desc';
          } else if ($scope[sortParam] == 'desc') {
              $scope[sortParam] = 'asc';
          } else if ($scope[sortParam] == 'asc') {
              $scope[sortParam] = '';
          }
      }

      $scope.paginationForm.roomsCurrentPage = 1;
      $scope.getRoomListSource();
  };
  $scope.roomsPageChanged = function() {
      $scope.getRoomListSource();
  };

  $scope.noBan = function(room, index) {
      var modalInstance = $modal.open({
          'templateUrl': 'noBan_template',
          'controller': 'RoomsIndexModalNoBanCtrl',
          'size': 'lg',
          'resolve': {
              'roomId': function() {
                  return room.id;
              },
              'nickname': function() {
                  return room.nickname;
              }
          }
      });

      modalInstance.result.then(function(param) {
          if (param) {
              $scope.list[index].status = '1';
          }
      }, function() {

      });
  };
  $scope.ban = function(room, index) {
      var modalInstance = $modal.open({
          'templateUrl': 'ban_template',
          'controller': 'RoomsIndexModalBanCtrl',
          'size': 'lg',
          'resolve': {
              'roomId': function() {
                  return room.id;
              },
              'nickname': function() {
                  return room.nickname;
              }
          }
      });

      modalInstance.result.then(function(param) {
          if (param) {
              $scope.list[index].status = '-1';
          }
      }, function() {

      });
  };

  /*直播间显隐*/
  $scope.roomHidden = function(room, index) {
      var modalInstance = $modal.open({
          'templateUrl': 'roomShowOrHidden',
          'controller': 'roomShowOrHiddenCtrl',
          'size': 'lg',
          'resolve': {
              'roomId': function() {
                  return room.id;
              },
              'type': function() {
                  return room.type;
              },
              'nickname': function() {
                  return room.nickname;
              }
          }
      });
  };

  /*生成外嵌代码*/
  $scope.showEmbedCode = function(obj) {
      var modalInstance = $modal.open({
          'templateUrl': 'showEmbedCode_template',
          'controller': 'showEmbedCodeCtrl',
          'size': 'lg',
          'resolve': {
              'info': function() {
                  return obj;
              },
          }
      });
  };
  // 直播流调度
  $scope.editDispatch = function(dispatch) {
      $http.post('/proxy/room.room_config_info', {
          "roomId": dispatch.id
      }).success(function(data) {
          if (data.code == 0) {
              var info = data.data;
              var modalInstance = $modal.open({
                  'templateUrl': 'editDispatch_template',
                  'controller': 'editDispatchCtrl',
                  'size': 'lg',
                  'resolve': {
                      'roomId': function() {
                          return dispatch.id;
                      },
                      'info': function() {
                          return data.data;
                      }
                  }
              });
          } else {
              alert(data.message);
          }
      });
  };

  $scope.showHistory = function(room) {
      var modalInstance = $modal.open({
          'templateUrl': 'banHistory_template',
          'controller': 'RoomsIndexModalBanHistoryCtrl',
          'size': 'lg',
          'resolve': {
              'roomId': function() {
                  return room.id;
              },
              'nickname': function() {
                  return room.nickname;
              }
          }
      });
  };
  $scope.showHiddenHistory = function(room) {
      var modalInstance = $modal.open({
          'templateUrl': 'showHiddenHistory',
          'controller': 'showHiddenHistoryCtrl',
          'size': 'lg',
          'resolve': {
              'roomId': function() {
                  return room.id;
              },
              'nickname': function() {
                  return room.nickname;
              }
          }
      });
  };

  $scope.detailDivStyle = 'display:none;';
  $scope.detailImg = '';
  $scope.imgMouseOver = function($event, pic) {
      var pageX = $event.pageX + 60;
      var pageY = $event.pageY;
      if (pageY + 370 >= $(document).height()) {
          pageY -= 293;
      }
      $scope.detailDivStyle = 'z-index:100; position:absolute; top:' + pageY + 'px; left:' + pageX + 'px;';
      $scope.detailImg = pic;
  };
  $scope.imgMouseLeave = function() {
      $scope.detailDivStyle = 'display:none;';
  };

  // 修改房间
  $scope.asyncRoomInfo = true;
  $scope.formUp = {};
  $scope.gameIdInfo = '';
  $scope.invisibility = "";
  $scope.checkFlag = '0';
  $scope.gameSource = {
      'selected': ''
  }
  $scope.showEdit = function(room, index) {
      $http.post('/proxy/room.room_info', {
          'roomId': room.id
      }).success(function(data) {
          $scope.asyncRoomInfo = false;
          $scope.invisibility = data.data.roomInfo.invisibility;
          if ($scope.invisibility == -1) {
              $scope.checkFlag = '1';
          } else $scope.checkFlag = '0';
          if (data.code == 0) {
              $scope.formUp = {
                      'cdnUp': data.data.up
                  }
              $scope.roomBaseInfoformData = {};
              var source = data.data;
              angular.extend($scope.roomBaseInfoformData, source.roomInfo);
              angular.extend($scope.roomBaseInfoformData, source.roomConfig);
              /*判断是否明显直播间*/
              if (source.roomConfig.length == 0) {
                  $scope.roomBaseInfoformData.isStar = '0';
                  source.roomConfig = {};
                  $scope.shareForm = {};
                  $scope.roomBaseInfoformData.roomFootWeight = {};
                  $scope.roomBaseInfoformData.starDesc = '';
                  $scope.roomBaseInfoformData.leftPicClose = '';
                  $scope.roomBaseInfoformData.leftPicOpen = '';
                  $scope.roomBaseInfoformData.rightPic = '';
              } else {
                  $scope.shareForm = {};
                  $scope.shareForm = source.roomConfig.share || {};
              };
              if (!source.roomConfig.starDesc) {
                  $scope.roomBaseInfoformData.isStar = '0';
                  $scope.roomBaseInfoformData.roomFootWeight = source.roomConfig.roomFootWeight || {}
                  $scope.roomBaseInfoformData.starDesc = '';
                  $scope.roomBaseInfoformData.leftPicClose = '';
                  $scope.roomBaseInfoformData.leftPicOpen = '';
                  $scope.roomBaseInfoformData.rightPic = '';
              } else {
                  $scope.roomBaseInfoformData.isStar = '1';
                  // document.getElementById("descData").innerHTML = source.roomConfig.starDesc;
                  $scope.roomBaseInfoformData.starDesc = source.roomConfig.starDesc;
                  $scope.roomBaseInfoformData.leftPicClose = source.roomConfig.leftPicClose;
                  $scope.roomBaseInfoformData.leftPicOpen = source.roomConfig.leftPicOpen;
                  $scope.roomBaseInfoformData.rightPic = source.roomConfig.rightPic;
                  $scope.roomBaseInfoformData.roomFootWeight = source.roomConfig.roomFootWeight || {}
              }
              $scope.gameIdInfo = source.roomInfo.gameId;
              $scope.gameSources = [];
              $scope.childGameList = [];
              $http.post('/proxy/common_api.get_games_list').success(function(data) {
                  if (data.code == 0) {
                      $scope.gameSources = data.data;
                      angular.forEach($scope.gameSources, function(p) {
                          if (p.child.length > 0) {
                              p.child.push({
                                  'name': '请选择游戏',
                                  'id': ''
                              })
                          };
                      })
                      angular.forEach($scope.gameSources, function(n) {
                          if ($scope.gameIdInfo == n.id) {
                              $scope.gameSource.selected = {
                                  'name': n.name,
                                  'id': n.id
                              };
                              $scope.childGameList = n.child;
                              if (n.child) {
                                  $scope.showGameChildFlag = 1;
                              };
                          } else {
                              angular.forEach(n.child, function(m) {
                                  if ($scope.gameIdInfo == m.id) {
                                      $scope.showGameChildFlag = 1;
                                      $scope.gameSource.childGameId = $scope.gameIdInfo;
                                      $scope.gameSource.selected = {
                                          'name': n.name,
                                          'id': n.id
                                      };
                                      $scope.childGameList = n.child;
                                  };
                              })
                          }
                      });
                  } else {
                      alert(data.message);
                  }
              });

              // 模板列表
              $scope.templates = source.roomTemplates;
              if (source.roomInfo.template == '0') {
                  $scope.template.selected = source.roomTemplates[0];
              } else {
                  angular.forEach(source.roomTemplates, function(n, i) {
                      if (source.roomInfo.template == n.value) {
                          $scope.template.selected = {
                              'text': n.text,
                              'value': n.value
                          };
                          return false;
                      }
                  });
              }
              // 推流地址
              if (source.roomInfo.publishUrl == 'dlrtmp' || source.roomInfo.publishUrl == '') {
                  $scope.publishUrl.selected = $scope.publishUrls[1];
              } else {
                  angular.forEach($scope.publishUrls, function(n, i) {
                      if (source.roomInfo.publishUrl == n.value) {
                          $scope.publishUrl.selected = {
                              'text': n.text,
                              'value': n.value
                          };
                          return false;
                      }
                  });
              };

              // 状态
              angular.forEach($scope.statuses, function(n, i) {
                  if (source.roomInfo.status == n.value) {
                      $scope.status.selected = {
                          'text': n.text,
                          'value': n.value
                      };
                      return false;
                  }
              });

              source.roomInfo.index = index;

              $('#tab1').data('$tabsetController').tabs[1].active = true;
          } else {
              alert(data.message);
          }
      });

      getAdminInfo(room.id);
      getPermissionInfo(room.id);
  };

  $scope.selGameFunc = function(t) {
      if (t.id) {
          angular.forEach($scope.gameSources, function(p) {
              if (p.id == t.id) {
                  $scope.childGameList = p.child;
              }
          });
          $scope.fatherGameId = t;
          $scope.showGameChildFlag = 1;
          $scope.gameSource.childGameId = '';
      };
  };
  $scope.childSel = function(n) {
          $scope.gameSource.childGameId = n;
      }
      // 房间资料-基本配置
  $scope.roomBaseInfoformData = {};
  $scope.asyncAdding = false;

  $scope.games = [];
  $scope.game = {
      'selected': {}
  };

  $scope.templates = [];
  $scope.template = {
      'selected': {}
  };

  $scope.publishUrls = [
      // {'text':'帝联','value':'dlrtmp'},
      {
          'text': '网宿',
          'value': 'wsrtmp'
      }, {
          'text': '云帆',
          'value': 'yfrtmp'
      }, {
          'text': '阿里',
          'value': 'alrtmp'
      }, {
          'text': '腾讯',
          'value': 'txrtmp'
      },
      // {'text':'高升','value':'gsrtmp'},
      {
          'text': '金山',
          'value': 'jsrtmp'
      }, {
          'text': '星域',
          'value': 'xyrtmp'
      }
  ];
  $scope.publishUrl = {
      'selected': {}
  };
  /*获取域名*/
  $scope.perDomainName = '';
  $http.post('/proxy/common_api.get_image_pre').success(function(data) {
      if (data.code == 0) {
          $scope.perDomainName = data.data;
      } else {
          alert(data.message)
      }
  });
  /*分享图片上传*/
  $timeout(function() {
      $scope.getSqBm = function(e, dom) {
          var file = e.currentTarget.files[0];
          var picType = $(e.target).data('type');
          if (picType == 'anchorCoverImg') {
              var shareMaxSize = 200 * 1024;
          } else {
              var shareMaxSize = 100 * 1024;
          };
          if (!file) {
              return false;
          }
          if (file.size > shareMaxSize) {
              alert('上传的图片超出大小限制  请重新上传!');
              return false;
          };
          var reader = new FileReader();
          reader.onload = function(e) {
              $scope.$apply(function($scope) {
                  var sendImg = e.target.result;
                  $http.post('/proxy/common_api.image_upload', {
                      'image': sendImg
                  }).success(function(data) {
                      if (data.code == 0) {
                          if (picType == 'anchorCoverImg') {
                              $scope.roomBaseInfoformData[picType] =$scope.perDomainName.imagePre + data.data.path;
                          } else if (picType == 'image') {
                              $scope.shareForm[picType] = data.data.path;
                          };
                      } else {
                          alert(data.message)
                      }
                  });
              });
          };
          reader.readAsDataURL(file);
      };
  }, 500);
  $timeout(function() {
      var maxSize = 300 * 1024;
      var handleFileSelect = function(evt) {
          var domId = evt.target.id;
          var file = evt.currentTarget.files[0];
          if (!file) {
              return false;
          }
          if (file.size > maxSize) {
              alert('上传的图片必须小于300KB');
              angular.element(document.querySelector('#' + domId)).val('');
              return false;
          }
          var reader = new FileReader();
          reader.onload = function(evt) {
              $scope.$apply(function($scope) {
                  $scope.roomBaseInfoformData[domId] = evt.target.result;
              });
          };
          reader.readAsDataURL(file);
      };
      angular.element(document.querySelector('#spic')).on('change', handleFileSelect);
      angular.element(document.querySelector('#bpic')).on('change', handleFileSelect);
      angular.element(document.querySelector('#leftPicOpen')).on('change', handleFileSelect);
      angular.element(document.querySelector('#leftPicClose')).on('change', handleFileSelect);
      angular.element(document.querySelector('#rightPic')).on('change', handleFileSelect);
  }, 500);
  /*直播间封面图上传*/
  $timeout(function(){
      var _URL = window.URL || window.webkitURL;
      var maxSize = 200*1024;
      $scope.getRoomPic = function(e,dom){
          var file = e.currentTarget.files[0];
          if (!file) {return false};
          if (file.size > maxSize) {
              alert('上传图片要小于200KB, 请重新上传!');
              return false;
          };
          var reader = new FileReader();
          reader.onload = function(e){
              img = new Image();
              img.onload = function(){
                  if (this.width!=520||this.height!=293) {
                      alert('上传图片尺寸不符合要求, 请重新上传!')
                      $scope.roomBaseInfoformData.anchorCoverImg = '';
                  }else{
                      $scope.$apply(function($scope){
                          var sendImgUrl = e.target.result;
                          $http.post('/proxy/common_api.image_upload',{'image':sendImgUrl}).success(function(data){
                              if (data.code  == 0) {
                                  $scope.roomBaseInfoformData['anchorCoverImg'] =$scope.perDomainName.imagePre + data.data.path;
                              }else{alert(data.message)}
                          })
                      })
                  };
              };
              img.src = _URL.createObjectURL(file); 
          }
          reader.readAsDataURL(file);
      };
  },500);
  $scope.saveRoomBase = function() {
      var finalGameId = ''
      if (!$scope.gameSource.childGameId) {
          finalGameId = $scope.gameSource.selected.id;
      } else {
          finalGameId = $scope.gameSource.childGameId;
      }
      $scope.roomBaseInfoformData.roomId = $scope.roomBaseInfoformData.id;
      $scope.roomBaseInfoformData.gameId = finalGameId;
      $scope.roomBaseInfoformData.template = $scope.template.selected.value;
      $scope.roomBaseInfoformData.publishUrl = $scope.publishUrl.selected.value;
      $scope.roomBaseInfoformData.status = $scope.status.selected.value;
      $scope.roomBaseInfoformData.checkFlag = $scope.checkFlag;
      if ($scope.roomBaseInfoformData.isStar == 1) {
          if (!$scope.roomBaseInfoformData.leftPicOpen || !$scope.roomBaseInfoformData.leftPicClose || !$scope.roomBaseInfoformData.rightPic || !$scope.roomBaseInfoformData.starDesc) {
              alert('明星直播间对应的4个参数为必填项');
              return false;
          };
      } else if ($scope.roomBaseInfoformData.isStar == 0) {
          delete $scope.roomBaseInfoformData.leftPicOpen;
          delete $scope.roomBaseInfoformData.leftPicClose;
          delete $scope.roomBaseInfoformData.rightPic;
          delete $scope.roomBaseInfoformData.starDesc;
      };
      if ($scope.shareForm.title && $scope.shareForm.content && $scope.shareForm.image) {
          $scope.roomBaseInfoformData.share = $scope.shareForm;
      };
      $http.post('/proxy/room.edit_room', $scope.roomBaseInfoformData).success(function(data) {
          if (data.code == 0) {
              alert('房间基本配置保存成功');
              $scope.getRoomListSource();
              $scope.roomBaseInfoformData = {};
              $('#tab1').data('$tabsetController').tabs[0].active = true;
          } else {
              alert(data.message);
          }
      });
  };

  // 房间资料-管理员配置
  $scope.adminTypes = [{
      'text': '临时管理员',
      'value': '10'
  }, {
      'text': '正式管理员',
      'value': '20'
  }, {
      'text': '房主',
      'value': '30'
  }];
  $scope.adminRoomId = '';
  $scope.adminSaveing = false;
  var getAdminInfo = function(roomId) {
      $scope.adminRoomId = roomId;
      $scope.asyncAdminListLoading = true;
      $http.post('/proxy/room.room_admin', {
          'roomId': roomId
      }).success(function(data) {
          $scope.asyncAdminListLoading = false;
          if (data.code == 0) {
              $scope.adminList = data.data;
              angular.forEach($scope.adminList, function(n, i) {
                  n.nicknameBak = n.nickname;
              });
          } else {
              alert(data.message);
          }
      });
  }
  $scope.addAdmin = function() {
      $scope.adminList.unshift({
          'nickname': '',
          'nicknameBak': '',
          'roleType': $scope.adminTypes[0].value
      });
  };
  $scope.delAdmin = function(index) {
      $scope.adminList.splice(index, 1);
  };
  $scope.saveAdminList = function() {
      $scope.adminSaveing = true;
      var admins = [];

      angular.forEach($scope.adminList, function(n, i) {
          if (n.nickname) {
              admins.push({
                  'nickname': n.nickname,
                  'nicknameBak': n.nicknameBak,
                  'roleType': n.roleType,
                  'id': n.id
              });
          }
      });

      $http.post('/proxy/room.edit_room_admin', {
          'roomId': $scope.adminRoomId,
          'admins': admins
      }).success(function(data) {
          if (data.code == 0) {
              alert('管理员配置保存成功');
          } else {
              alert(data.message);
          }
          $scope.adminSaveing = false;
      });
  };

  // 房间资料-权限权利
  $scope.permissionTypes = [{
      'text': '默认',
      'value': '2'
  }, {
      'text': '开启',
      'value': '1'
  }, {
      'text': '关闭',
      'value': '0'
  }];
  $scope.permissionRoomId = '';
  $scope.permissionData = {};
  $scope.formData1 = {};
  $scope.editArrClient = [];
  var getPermissionInfo = function(roomId) {
      $scope.permissionRoomId = roomId;
      $scope.asyncPermissionLoading = true;
      $http.post('/proxy/room.room_permission', {
          'roomId': roomId
      }).success(function(data) {
          $scope.asyncPermissionLoading = false;
          if (data.code == 0) {
              $scope.editArrClient = data.data.ext.translateLanguages;
              // $scope.editArrClient=['en','jp']
              // $scope.editArrClient=[]
              $scope.formData1 = {
                  'client': data.data.data.ext
              }
              var client = {};
              angular.forEach($scope.editArrClient, function(n, i) {
                  if (n == 'en') {
                      client.English = true;
                  }
                  if (n == 'jp') {
                      client.Japanese = true;
                  }
                  if (n == 'spa') {
                      client.Spain = true;
                  }
                  if (n == 'ru') {
                      client.Russian = true;
                  }
                  if (n == 'th') {
                      client.Thai = true;
                  }
                  if (n == 'kor') {
                      client.Korean = true;
                  }
              });
              $scope.formData1.client = client;
              // console.log($scope.formData1.client)
              if (data.data.data == undefined || data.data.data == '' || data.data.data == null) {
                  $scope.permissionData = {
                      'fans': '2',
                      'guess': '2',
                      'replay': '2',
                      'multi': '2',
                      'shift': '2',
                      'firework': '2',
                      'googleAd': '2',
                      'translate': '0',
                      'video': '2'
                  };
              } else {
                  $scope.permissionData = data.data.data;
              }
              if (typeof(data.data.data.firework) == undefined || data.data.data.firework == null || data.data.data.firework == '') {
                  var fireworks = data.data.data.firework = '2';
                  $scope.permissionData.firework = fireworks;
              }
              if (typeof(data.data.data.guess) == undefined || data.data.data.guess == null || data.data.data.guess == '') {
                  var guesss = data.data.data.guess = '2';
                  $scope.permissionData.guess = guesss;
              }
              if (typeof(data.data.data.replay) == undefined || data.data.data.replay == null || data.data.data.replay == '') {
                  var replays = data.data.data.replay = '2';
                  $scope.permissionData.replay = replays;
              }
              if (typeof(data.data.data.multi) == undefined || data.data.data.multi == null || data.data.data.multi == '') {
                  var multis = data.data.data.multi = '2';
                  $scope.permissionData.multi = multis;
              }
              if (typeof(data.data.data.shift) == "function" || typeof(data.data.data.shift) == undefined || data.data.data.shift == null || data.data.data.shift == '') {
                  var shifts = data.data.data.shift = '2';
                  $scope.permissionData.shift = shifts;
              }
              if (typeof(data.data.data.video) == undefined || data.data.data.video == null || data.data.data.video == '') {
                  var videos = data.data.data.video = '2';
                  $scope.permissionData.video = videos;
              }
              if (typeof(data.data.data.fans) == undefined || data.data.data.fans == null || data.data.data.fans == '') {
                  var fanss = data.data.data.fans = '2';
                  $scope.permissionData.fans = fanss;
              }
              if (typeof(data.data.data.googleAd) == undefined || data.data.data.googleAd == null || data.data.data.googleAd == '') {
                  var googleAds = data.data.data.googleAd = '2';
                  $scope.permissionData.googleAd = googleAds;
              }
              if (typeof(data.data.data.translate) == undefined || data.data.data.translate == null || data.data.data.translate == '') {
                  var translates = data.data.data.translate = '0';
                  $scope.permissionData.translate = translates;
              }
          } else {
              alert(data.message);
          }
      });
  };
  $scope.savePermission = function() {
      $scope.permissionFormSaveing = true;
      var arrClient = [];
      if ($scope.formData1.client['English']) {
          arrClient.push('en')
      }
      if ($scope.formData1.client['Japanese']) {
          arrClient.push('jp')
      }
      if ($scope.formData1.client['Spain']) {
          arrClient.push('spa')
      }
      if ($scope.formData1.client['Russian']) {
          arrClient.push('ru')
      }
      if ($scope.formData1.client['Thai']) {
          arrClient.push('th')
      }
      if ($scope.formData1.client['Korean']) {
          arrClient.push('kor')
      }
      if ($scope.permissionData.translate != '1') {
          arrClient = [];
      }
      $http.post('/proxy/room.edit_room_permission', {
          'roomId': $scope.permissionRoomId,
          'permission': $scope.permissionData,
          'translateLanguages': arrClient
      }).success(function(data) {
          if (data.code == 0) {
              alert('权限管理保存成功');
          } else {
              alert(data.message);
          }
          $scope.permissionFormSaveing = false;
      });
  };

  // 
  $scope.getRoomListSource();
}]);

app.controller('RoomsIndexModalBanCtrl', ['$scope', '$modalInstance', '$http', '$timeout', 'roomId', 'nickname', function($scope, $modalInstance, $http, $timeout, roomId, nickname) {
  $scope.ipInfo = {};
  $http.post('/proxy/common_api.prohibit_log', {
      'roomId': roomId
  }).success(function(data) {
      if (data.code == 0) {
          $scope.ipInfo = data.data.ipInfo;
          // console.log($scope.ipInfo)
      } else {
          alert(data.message);
      }
  });
  $scope.asyncAdding = false;
  $scope.nickname = nickname;

  $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      class: 'datepicker'
  };

  $timeout(function() {
      var maxSize = 1000 * 1024;
      var handleFileSelect = function(evt) {
          var domId = evt.target.id;
          var file = evt.currentTarget.files[0];
          if (!file) {
              return false;
          }
          if (file.size > maxSize) {
              alert('上传的图片必须小于1MB');
              angular.element(document.querySelector('#' + domId)).val('');
              return false;
          }
          var reader = new FileReader();
          reader.onload = function(evt) {
              $scope.$apply(function($scope) {
                  $scope.banPic = evt.target.result;
              });
          };
          reader.readAsDataURL(file);
      };
      angular.element(document.querySelector('#banPic')).on('change', handleFileSelect);
  }, 500);

  $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
  };

  $scope.save = function() {
      var postData = {
          'id': roomId,
          'toAnchor': $scope.toAnchor,
          'isIp': $scope.banType,
          'pic': $scope.banPic
      };
      if ($scope.dt) {
          postData.endTime = $scope.dt.Format('yyyy-MM-dd hh:mm:ss');
      } else {
          var now = new Date('2035');
          postData.endTime = now.Format('yyyy-MM-dd hh:mm:ss');
      }

      if ($scope.banReson == 'radio3') {
          postData.remark = $scope.banOtherReson;
      } else {
          if ($scope.banReson == '直播违禁内容') {
              postData.remark = $scope.banReson + ($scope.banResonDetail ? $scope.banResonDetail : '');
          } else {
              postData.remark = $scope.banReson;
          }
      }

      $scope.asyncAdding = true;
      $http.post('/proxy/common_api.room_prohibit', postData).success(function(data) {
          $scope.asyncAdding = false;
          if (data.code == 0) {
              $modalInstance.close(postData);
          } else {
              alert(data.message);
          }
      });
  };

  $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
  };
}]);

app.controller('RoomsIndexModalNoBanCtrl', ['$scope', '$modalInstance', '$http', 'roomId', 'nickname', function($scope, $modalInstance, $http, roomId, nickname) {
  $scope.asyncAdding = false;
  $scope.nickname = nickname;

  $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      class: 'datepicker'
  };

  $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
  };

  $scope.save = function() {
      var postData = {
          'roomId': roomId,
          'remark': $scope.noBanReson
      };
      // if($scope.dt) {
      //     postData.endTime = $scope.dt.Format('yyyy-MM-dd hh:mm:ss');
      // } else {
      //     var now = new Date('2100');
      //     postData.endTime = now.Format('yyyy-MM-dd hh:mm:ss');
      // }

      $scope.asyncAdding = true;
      $http.post('/proxy/common_api.unprohibit_room', postData).success(function(data) {
          $scope.asyncAdding = false;
          if (data.code == 0) {
              $modalInstance.close(postData);
          } else {
              alert(data.message);
          }
      });
  };

  $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
  };
}]);

app.controller('RoomsIndexModalBanHistoryCtrl', ['$scope', '$modalInstance', '$http', 'roomId', 'nickname', function($scope, $modalInstance, $http, roomId, nickname) {
  $scope.async = true;
  $scope.nickname = nickname;

  $http.post('/proxy/room.show_type_log', {
      'roomId': roomId
  }).success(function(data) {
      if (data.code == 0) {
          $scope.showOrHidden = data.data;
      } else {
          alert(data.message);
      }
  });

  $http.post('/proxy/common_api.prohibit_log', {
      'roomId': roomId
  }).success(function(data) {
      $scope.async = false;
      $scope.list = [];
      if (data.code == 0) {
          // console.log(data)
          var source = data.data.logs;
          angular.forEach(source, function(n, i) {
              if (n.unprohibit == '-1') {
                  $scope.list.push({
                      'adminUser': n.adminUser,
                      'startTime': n.startTime,
                      'endTime': n.endTime,
                      'remark': n.remark,
                      'unprohibit': n.unprohibit,
                      'pic': n.pic
                  });
              } else if (n.unprohibit == '1') {
                  if (n.adminUser2 == '-1') {
                      $scope.list.push({
                          'adminUser2': '系统',
                          'unprohibitTime': n.unprohibitTime,
                          'remark2': '禁播时间到期，自动解禁',
                          'unprohibit': n.unprohibit
                      });
                  } else {
                      $scope.list.push({
                          'adminUser2': n.adminUser2,
                          'unprohibitTime': n.unprohibitTime,
                          'remark2': n.remark2,
                          'unprohibit': n.unprohibit
                      });
                  }
                  $scope.list.push({
                      'adminUser': n.adminUser,
                      'startTime': n.startTime,
                      'endTime': n.endTime,
                      'remark': n.remark,
                      'unprohibit': '-1',
                      'pic': n.pic
                  });
              }
          });
      } else {
          alert(data.message);
      }
  });

  $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
  };
}]);


app.controller('roomShowOrHiddenCtrl', ['$scope', '$modalInstance', '$http', 'roomId', 'type', 'nickname', function($scope, $modalInstance, $http, roomId, type, nickname) {
  $scope.nickname = nickname;
  // console.log(roomId);
  // console.log(type);
  // console.log("show/hidden");
  $scope.type = type;
  $scope.saveChecked = function() {
      var param = {
          'roomId': roomId,
          'type': $scope.type,
          'remark': $scope.remark
      };
      $http.post('/proxy/room.edit_type', param).success(function(data) {
          if (data.code == 0) {
              alert("修改成功");
              window.location.reload();
          } else {
              alert(data.message);
          }
      });
  };

  $scope.cancelChecked = function() {
      $modalInstance.dismiss('cancel');
  };
}]);

app.controller('editDispatchCtrl', ['$scope', '$modalInstance', '$http', 'roomId', 'info', function($scope, $modalInstance, $http, roomId, info) {
  $scope.formData = info
  $scope.addDispatch = function() {
      if (!$scope.formData.flashVars && !$scope.formData.cdns) {
          alert("至少选择一项");
          return false;
      };
      var param = {
          'flashVars': $scope.formData.flashVars,
          'cdns': $scope.formData.cdns,
          'roomId': roomId
      }
      $http.post('/proxy/room.room_config_edit', param).success(function(data) {
          if (data.code == 0) {
              alert("保存成功")
              $modalInstance.dismiss('cancel')
          } else {
              alert(data.message);
          }
      });
  };
  $scope.cancelDispatch = function() {
      $modalInstance.dismiss('cancel')
  }
}]);
app.controller('showEmbedCodeCtrl', ['$scope', '$modalInstance', '$http', 'info', function($scope, $modalInstance, $http, info) {
  $scope.formData = {};
  $scope.embedFeatures = [{
      'name': '播放器中间"进去直播间按钮"',
      'value': 'Ent',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '全屏按钮跳转到战旗功能',
      'value': 'EmbFul',
      'checked': false,
      'defaultValue': false
  }, {
      'name': '播放器顶部栏',
      'value': 'EmbTop',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '停播推荐显示',
      'value': 'EmbRec',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '右下角“进入直播间”按钮',
      'value': 'BkblEnt',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '控制栏，设置按钮',
      'value': 'Sett',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '控制栏, 转屏按钮',
      'value': 'RotBt',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '外嵌使用p2p',
      'value': 'EmbedAcc',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '播放器双击跳转战旗功能',
      'value': 'EmbedDc',
      'checked': true,
      'defaultValue': true
  }, {
      'name': '静音',
      'value': 'Mute',
      'checked': false,
      'defaultValue': false
  }, {
      'name': '弹幕显示',
      'value': 'ComDef',
      'checked': true,
      'defaultValue': true
  }, {
      'name': 'logo位置',
      'value': 'logoPos',
      'checked': true,
      'defaultValue': true
  }, ];
  $scope.saveUrlInfo = ''
  $scope.save = function() {
      if (!$scope.formData.fhost) {
          alert('请填写外嵌标识 不然追溯不了来源!');
          return false;
      } else {
          var embedInfo = {
              'roomId': info.id,
              'fhost': $scope.formData.fhost
          };
          angular.forEach($scope.embedFeatures, function(p) {
              if (p.checked != p.defaultValue) {
                  if (p.checked) {
                      embedInfo[p.value] = 1
                  } else {
                      embedInfo[p.value] = 0
                  };
              };
          });
          var srcInfo = $.param(embedInfo);
          var urlInfo = "<iframe height=498 width=510   src=http://www.zhanqi.tv/live/embed?" + srcInfo + "    frameborder=0 allowfullscreen></iframe>"
          $scope.saveUrlInfo = urlInfo;
      };
  };
  $scope.cancel = function() {
      $modalInstance.dismiss()
  }
}]);

Date.prototype.Format = function(fmt) { //author: meizz 
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}