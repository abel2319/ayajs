## aya.Point(x, y, r)

<style>
.empty-space{
    visibility:hidden;
    display:inline-block;
    border:none;
}
.table_1 .thead-row {
    border-top:none;
}
.type_style{
    transform:rotate(-40deg);
}
</style>
<body>
<b>Specifications : </b>  aya.Point is a method that takes three parameters as arguments like shown in this table:

<table class='table_1'>
    <thead>
    <tr class="thead-row">
        <th class="empty-space"></th>
        <th>Argument</th>
        <th>Description</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td class="type_style">number</td>
        <td>x</td>
        <td>
            The abscissa of the center of the circle, x pixels from the upper left corner of the browser along the horizontal line.
        </td>
    </tr>
    <tr>
        <td class="type_style">number</td>
        <td>y</td>
        <td>
            The ordinate of the center of the circle, distant by y pixel from the upper left corner of the browser along the vertical
        </td>
    </tr>
     <tr>
        <td class="type_style">number</td>
        <td>r</td>
        <td>The radius of the point</td>
    </tr>
    </tbody>
</table>
</body>

Here is an example of how you can create a point form.

<strong>
    This shape is specially designed to represent the vertexes, the connection points of known geometric shapes (rectangle, lozenge, triangle, line).
</strong>

```sh
<script>
    var pt = aya.Point(100, 150, 20);
    pt.draw();
</script>
```