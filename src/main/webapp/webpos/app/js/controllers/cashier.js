App.controller('cashierController',['$scope','$http','ngDialog',function($scope,$http,ngDialog){
	$scope.totalAmount= 0.00;//总金额
	$scope.parseInt = parseInt;
	$scope.pendingFlag = false;//是否显示挂单列表页面
	$scope.searchFlag = true;//是否显示商品查询页面
	//商品搜索
	$scope.searchProduct = function(searchContent){
		$scope.searchFlag = false;//显示商品查询页面
		$scope.loadMore();
	}
	
	//返回收银主界面
	$scope.returnCashierView = function(){
		$scope.searchFlag = true;
		$scope.resetSearchProductPramas();
	}
	
	//加入购物车
	$scope.addShoppingCart = function(product,event){
		$scope.shoppingCart.push(product);
		$(event.target).css("display","none");
		$(event.target).after("<span class='text-muted'>已加购</span>");
	}
	
	//查询购物车
	$scope.getShoppingCart = function(){
		$http.get('server/cashier.json').success(function(data) {
	      $scope.shoppingCart = data;
	    }).error(function(){
	    	alert("error");
	    });
	}
	$scope.getShoppingCart();
	//删除购物车中的某个单品
	$scope.delProduct = function(index,productId){
		ngDialog.openConfirm({
	      template: 'modalDialogId',
	      className: 'ngdialog-theme-default'
	    }).then(function (value) {
	    	$scope.shoppingCart.splice(index,1);
	    }, function (reason) {
	      console.log('Modal promise rejected. Reason: ', reason);
	    });
	}
	//清空购物车
	$scope.clearShoppingCart = function(){
		$scope.shoppingCart = [];
	}
	
	$scope.openConfirm = function () {
	    ngDialog.openConfirm({
	      template: 'modalDialogId',
	      className: 'ngdialog-theme-default'
	    }).then(function (value) {
	      console.log('Modal promise resolved. Value: ', value);
	    }, function (reason) {
	      console.log('Modal promise rejected. Reason: ', reason);
	    });
	  };
	
	$scope.openSecond = function () {
	    ngDialog.open({
	      template: '<p class="lead m0"><a href="" ng-click="closeSecond()">Close all by click here!</a></h3>',
	      plain: true,
	      closeByEscape: false,
	      controller: 'SecondModalCtrl'
	    });
	  };
	  
	//查看挂单列表
	$scope.showPendingList = function(flag){
		$scope.pendingFlag = flag;
	}
	
	//挂单操作
	$scope.pending = function(){
		ngDialog.openConfirm({
	      template: 'pendingModalDialogId',
	      className: 'ngdialog-theme-default'
	    }).then(function (value) {
	      console.log('Modal promise resolved. Value: ', value);
	    }, function (reason) {
	      console.log('Modal promise rejected. Reason: ', reason);
	    });
	}
	
	//重置商品搜索页面用到的参数
	$scope.resetSearchProductPramas = function(){
		$scope.productList = [];
		$scope.page = 0;
		$scope.pageSize = 10;
		$scope.busy = false;
	}
	
	$scope.productList = [];
	$scope.page = 0;
	$scope.pageSize = 10;
	$scope.busy = false;
	//商品搜索页面鼠标滚动到底部时，触发加载更多
	$scope.loadMore = function() {
		$scope.busy = true;
		$http.get('server/products.json').success(function(data) {
       	   if($scope.page == 0){
       		   for (var i = 0; i < ($scope.pageSize*($scope.page+1)); i++) {
       			   $scope.productList.push(data[i]);
               }
       	   }else{
       		   for (var i = ($scope.page+$scope.pageSize); i < ($scope.pageSize*($scope.page+1)); i++) {
       			   $scope.productList.push(data[i]);
               }
       	   }
       	    $scope.busy = false;
            $scope.page += 1;
  	     });
	 };
	
}]);

//求商品总数
App.filter('sumOfNumber', function() {  
	return function(data, key1){
	    if(typeof(data) === undefined || typeof(key1) === undefined) {
	      return 0;
	    }
	    var sum = 0,
	        i = data.length - 1;
	    for(; i >= 0; i--) {
	      sum += parseInt(data[i][key1]);
	    }

	    return sum;
    };  
});

//求价格总和
App.filter('sumOfPrice', function() {  
	return function(data, key1, key2){
	    if(typeof(data) === undefined || typeof(key1) === undefined || typeof(key2) === undefined) {
	      return 0;
	    }
	    var sum = 0,
	        i = data.length - 1;
	    for(; i >= 0; i--) {
	      sum += parseFloat(data[i][key1])*parseInt(data[i][key2]);
	    }

	    return sum;
    };  
});

//增加、减少单品数量
App.directive('numberOperation', function() {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.on('click', function (e) {
          e.preventDefault();
          if(typeof($(this).prev().val()) !="undefined"){//说明是增加按钮
        	  /**
        	   * 需要注意这里需要增加对单品库存的判断
        	   */
        	  $(this).prev().val(parseInt($(this).prev().val())+1);
              $(this).prev().trigger('change');  
          }else{//说明是减少按钮
        	  if($(this).next().val() > 1){
        		  $(this).next().val(parseInt($(this).next().val())-1);
                  $(this).next().trigger('change');  
        	  }
          }
      });
    }
  };
});

//对手动输入的数量进行检查
App.directive('checkNumber', function() {
	  'use strict';
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {
	      element.on('keyup', function (e) {
	          e.preventDefault();
	          if($(this).val() == "" || $(this).val() == "0"){
	        	  $(this).val(1);
	          }else{
	        	  //先把非数字的都替换掉，除了数字和.
	        	  $(this).val($(this).val().replace(/[^\d]/g,""));
	          }
			//将改变的值同步到ng-model
			$(this).trigger('change');  
	      });
	    }
	  };
});

//对手动输入的单品价格进行检查
App.directive('checkPrice', function($get) {
	  'use strict';
	  return {
	    restrict: 'A',
	    link: function(scope, element, attrs) {
	      element.on('keyup', function (e) {
	          e.preventDefault();
	          if($(this).val() == "" || $(this).val() == "0"){
	        	  $(this).val(0.00);
	          }else{
	        	  //先把非数字的都替换掉，除了数字和.
	        	  $(this).val($(this).val().replace(/[^\d]/g,""));
	          }
			 //将改变的值同步到ng-model
			 $(this).trigger('change');  
	      });
	    }
	  };
});