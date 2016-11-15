---
layout: post
title: jQuery 表格插件 DataTables
categories: development
description: 记录学习 DataTables 的一些笔记。
keywords: DataTables, jQuery, notes
---

DataTables 是一个基于 jQuery 的功能强大的 Table 解决方案。

参考链接：

* [DataTables 官网](https://datatables.net/)
* [Datatables 中文网](http://datatables.club/)
* [JQuery之DataTables强大的表格解决方案](http://www.cnblogs.com/jobs2/p/3431567.html)

## 基本初始化

### 基本用法

	$('#example').DataTable();

详细 options 配置项请参考：[https://datatables.net/reference/option/](https://datatables.net/reference/option/)

```javascript
$('#example').DataTable( {
    "paging":   false,
    "ordering": false,
    "info":     false
} );
```

### DOM positioning

Datatables 用一种奇怪的语法来控制它的不同部分的显示和位置。

* l - Length，每页显示的记录数(PageSize)
* f - Filter，过滤(Search)
* t - Table，表格
* i - Info，信息
* p - Pagination，分页
* r - pRocessing，正在处理中

```javascript
$('#example').DataTable( {
    "dom": '<lf<t>ip>'
} );
```

会生成下面的 DOM 结构：

```html
<div>
    { length }
    { filter }
    <div>
        { table }
    </div>
    { info }
    { paging }
</div>
```

另外一个例子，

```javascript
$('#example').DataTable( {
    "dom": '<"top"i>rt<"bottom"flp><"clear">'
} );
```

会生成下面的 DOM 结构：

```html
<div class="top">
    { info }
</div>
{ processing }
{ table }
<div class="bottom">
    { filter }
    { length }
    { paging }
</div>
```

详细说明请参考：[https://datatables.net/examples/basic_init/dom.html](https://datatables.net/examples/basic_init/dom.html)

## 高级初始化

### DOM / jQuery 事件

```javascript
$(document).ready(function() {
    var table = $('#example').DataTable();
    
    $('#example tbody').on('click', 'tr', function () {
        var data = table.row( this ).data();
        alert( 'You clicked on '+data[0]+'\'s row' );
    } );
} );
```

### DataTables 事件

详细事件列表请参考：[https://datatables.net/reference/event/](https://datatables.net/reference/event/)

以 order 事件为例：

```javascript
var table = $('#example').DataTable();

$('#example').on( 'order.dt', function () {
    // This will show: "Ordering on column 1 (asc)", for example
    var order = table.order();
    $('#orderInfo').html( 'Ordering on column '+order[0][0]+' ('+order[0][1]+')' );
} );
```

### Column rendering

下面的例子是将第4列的数据用括号括起来了，也显示在第一列的数据后面。

render 方法的详细参数请参考：[https://datatables.net/reference/option/columns.render](https://datatables.net/reference/option/columns.render)。

```javascript
$(document).ready(function() {
    $('#example').DataTable( {
        "columnDefs": [
            {
                // The `data` parameter refers to the data for the cell (defined by the
                // `data` option, which defaults to the column being worked with, in
                // this case `data: 0`.
                "render": function ( data, type, row ) {
                    return data +' ('+ row[3]+')';
                },
                "targets": 0
            },
            { "visible": false,  "targets": [ 3 ] }
        ]
    } );
} );
```

### Read HTML to data objects

DataTables 可以把一个已经存在的原生的 table 的数据读到一个 javascript 对象里面。

    {
        "name": "...",
        "position": "...",
        "office": "...",
        "age": "...",
        "start_date": "...",
        "salary": "..."
    }

### Row created callback

如果第6列的数值大于 150000 则高亮。

```javascript
$('#example').DataTable( {
    "createdRow": function ( row, data, index ) {
        if ( data[5].replace(/[\$,]/g, '') * 1 > 150000 ) {
            $('td', row).eq(5).addClass('highlight');
        }
    }
} );
```

### Row grouping

在 drawCallback 事件中根据第三列的 location 数值插入 group 行。 

```javascript
var table = $('#example').DataTable({
    "columnDefs": [
        { "visible": false, "targets": 2 }
    ],
    "order": [[ 2, 'asc' ]],
    "displayLength": 25,
    "drawCallback": function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last=null;

        api.column(2, {page:'current'} ).data().each( function ( group, i ) {
            if ( last !== group ) {
                $(rows).eq( i ).before(
                    '<tr class="group"><td colspan="5">'+group+'</td></tr>'
                );

                last = group;
            }
        } );
    }
} );

// Order by the grouping
$('#example tbody').on( 'click', 'tr.group', function () {
    var currentOrder = table.order()[0];
    if ( currentOrder[0] === 2 && currentOrder[1] === 'asc' ) {
        table.order( [ 2, 'desc' ] ).draw();
    }
    else {
        table.order( [ 2, 'asc' ] ).draw();
    }
} );
```

### Footer callback

Footer 可以自定义

```javascript
$('#example').DataTable( {
    "footerCallback": function ( row, data, start, end, display ) {
        var api = this.api(), data;

        // Remove the formatting to get integer data for summation
        var intVal = function ( i ) {
            return typeof i === 'string' ?
                i.replace(/[\$,]/g, '')*1 :
                typeof i === 'number' ?
                    i : 0;
        };

        // Total over all pages
        total = api
            .column( 4 )
            .data()
            .reduce( function (a, b) {
                return intVal(a) + intVal(b);
            }, 0 );

        // Total over this page
        pageTotal = api
            .column( 4, { page: 'current'} )
            .data()
            .reduce( function (a, b) {
                return intVal(a) + intVal(b);
            }, 0 );

        // Update footer
        $( api.column( 4 ).footer() ).html(
            '$'+pageTotal +' ( $'+ total +' total)'
        );
    }
} );
```

## API

### Accessing the API

有三种方式**访问 api**，

- $( selector ).DataTable();
- $( selector ).dataTable().api();
- new $.fn.dataTable.Api( selector );

注意 $( selector ).DataTable() 与 $( selector ).dataTable() 的区别。前者返回 api，后者返回 jQuery 对象。

**api 与 jQuery 对象**可以相互转换。

``` javascript
api.to$()                           // api 转成 jQuery 对象
$( selector ).dataTable().api()     // jQuery 对象 转成 api
```

通过 **api 访问 Table Dom** 节点，

``` javascript
const $tableDomNode = $(api.table().node());
```

## 数据源、Ajax 和服务端处理

### HTML (DOM) sourced data

DataTables 可以直接从 DOM 直接读取 table 数据。

### Ajax sourced data

DataTables 可以通过 ajax 选项去读取不同类型的数据。

```javascript
$('#example').DataTable( {
    "ajax": '../ajax/data/arrays.txt'
} );
```

更多例子请参考 [Ajax examples](https://datatables.net/examples/ajax/)。

### Javascript sourced data

也可以直接通过 data 选项设置数据。

```javascript
$('#example').DataTable( {
    data: dataSet,
    columns: [
        { title: "Name" },
        { title: "Position" },
        { title: "Office" },
        { title: "Extn." },
        { title: "Start date" },
        { title: "Salary" }
    ]
} );
```

### Server-side processing

ajax 选项也可以提交一些更复杂的参数到服务器端去请求数据。比如，

```javascript
$('#example').DataTable( {
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "scripts/server_processing.php",
        "type": "POST",
        "data": function ( d ) {
            d.myKey = "myValue";
            // d.custom = $('#myInput').val();
            // etc
        }
    }
} );
```

详见：[Server-side processing](https://datatables.net/examples/server_side/)



## 插件

DataTables 给开发人员提供了一个插件的框架。

### API plug-ins

- https://datatables.net/plug-ins/api/
- https://datatables.net/plug-ins/api/sum()
- https://datatables.net/reference/api/

## 扩展

### FixedColumns

FixedColumns 添加的事件以 .dt.DTFC 结尾。

- [https://github.com/DataTables/FixedColumns/blob/master/js/dataTables.fixedColumns.js](https://github.com/DataTables/FixedColumns/blob/master/js/dataTables.fixedColumns.js)

### Fixed Header

参考链接：

- [markmalek/Fixed-Header-Table - github.com](https://github.com/markmalek/Fixed-Header-Table/blob/master/jquery.fixedheadertable.js) 
- [mustafaozcan/jquery.fixedtableheader - github.com](https://github.com/mustafaozcan/jquery.fixedtableheader/blob/master/src/jquery.fixedtableheader.js)
- [jmosbech/StickyTableHeaders - github.com](https://github.com/jmosbech/StickyTableHeaders/blob/master/js/jquery.stickytableheaders.js)
- [http://js.do/thxiso/118986](http://js.do/thxiso/118986) adjust scrollbar style

### row grouping

- [http://legacy.datatables.net/release-datatables/extras/FixedColumns/row_grouping_height.html](http://legacy.datatables.net/release-datatables/extras/FixedColumns/row_grouping_height.html)
- [http://legacy.datatables.net/release-datatables/extras/FixedColumns/row_grouping.html](http://legacy.datatables.net/release-datatables/extras/FixedColumns/row_grouping.html)
- [https://datatables.net/examples/advanced_init/row_grouping.html](https://datatables.net/examples/advanced_init/row_grouping.html)

## 一些链接

- [https://datatables.net/reference/option/](https://datatables.net/reference/option/)
- [https://datatables.net/reference/api/](https://datatables.net/reference/api/)

