---
layout: post
title: DataTables 笔记
categories: javascript
description: 记录学习 DataTables 的一些笔记。
keywords: DataTables, jQuery, notes
---

DataTables 是一个基于 jQuery 的功能强大的 Table 解决方案。

参考链接：

* [DataTables 官网](https://datatables.net/)
* [Datatables 中文网](http://datatables.club/)
* [JQuery之DataTables强大的表格解决方案](http://www.cnblogs.com/jobs2/p/3431567.html)

## 基本用法

	$('#example').DataTable();

详细 options 配置项请参考：[https://datatables.net/reference/option/](https://datatables.net/reference/option/)

    $('#example').DataTable( {
        "paging":   false,
        "ordering": false,
        "info":     false
    } );

## DOM positioning

Datatables 用一种奇怪的语法来控制它的不同部分的显示和位置。

    $('#example').DataTable( {
        "dom": '<lf<t>ip>'
    } );

会生成下面的 DOM 结构：

    <div>
        { length }
        { filter }
        <div>
            { table }
        </div>
        { info }
        { paging }
    </div>

详细说明请参考：[https://datatables.net/examples/basic_init/dom.html](https://datatables.net/examples/basic_init/dom.html)

## DOM / jQuery 事件

    $(document).ready(function() {
        var table = $('#example').DataTable();
        
        $('#example tbody').on('click', 'tr', function () {
            var data = table.row( this ).data();
            alert( 'You clicked on '+data[0]+'\'s row' );
        } );
    } );

## DataTables 事件

详细事件列表请参考：[https://datatables.net/reference/event/](https://datatables.net/reference/event/)

以 order 事件为例：

    var table = $('#example').DataTable();
    
    $('#example').on( 'order.dt', function () {
        // This will show: "Ordering on column 1 (asc)", for example
        var order = table.order();
        $('#orderInfo').html( 'Ordering on column '+order[0][0]+' ('+order[0][1]+')' );
    } );

## Column rendering

下面的例子是将第4列的数据用括号括起来了，也显示在第一列的数据后面。

render 方法的详细参数请参考：[https://datatables.net/reference/option/columns.render](https://datatables.net/reference/option/columns.render)。

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

## Read HTML to data objects

DataTables 可以把一个已经存在的原生的 table 的数据读到一个 javascript 对象里面。

    {
        "name": "...",
        "position": "...",
        "office": "...",
        "age": "...",
        "start_date": "...",
        "salary": "..."
    }


