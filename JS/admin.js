// 初始畫面
function init() {
  getOrderList();
}
init();

// 跟後台取得訂單資料
let orderData = [];

function getOrderList() {
  axios
    .get(`${base_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })

    .then(function (response) {
      orderData = response.data.orders;

      let str = "";

      // 如果沒訂單
      if (orderData.length == 0) {
        str = `<tr>
               <td></td>
               <td></td>
               <td></td>
               <td><p style="text-align:center">◢▆▅▄▃ 空空 ╰(〒皿〒)╯ 如也 ▃▄▅▇◣</p></td>
               <td></td>
               <td></td>
               <td></td>
               <td></td>
              </tr>`;
      }

      orderData.forEach((item) => {
        // 日期字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;

        // 訂單品項字串
        let productStr = "";
        item.products.forEach((productItem, index) => {
          if (index > 0) {
            productStr += "<br/>";
          }
          productStr += `${productItem.title} × ${productItem.quantity}`;
        });

        // 訂單狀態
        let orderStatus = "";
        item.paid == true ? (orderStatus = "已處理") : (orderStatus = "未處理");

        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" class="orderStatusLink" order-id="${item.id}"
             order-status="${item.paid}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" 
          order-id="${item.id}" value="刪除" />
        </td>`;
      });
      orderList.innerHTML = str;
      renderC3();
    });
}

// 更改訂單狀態、刪除單筆訂單
const orderList = document.querySelector(".order-list");
const orderStatus = document.querySelector(".orderStatus");
const delSingleOrderBtn = document.querySelector(".delSingleOrder-Btn");

orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("order-id");

  // 更改訂單狀態
  if (targetClass == "orderStatusLink") {
    let status = e.target.getAttribute("order-status");

    let newStatus;
    status == "true" ? (newStatus = false) : (newStatus = true);

    axios
      .put(
        `${base_url}/admin/${api_path}/orders`,
        {
          data: {
            id: id,
            paid: newStatus,
          },
        },
        {
          headers: {
            authorization: token,
          },
        }
      )

      .then(function (response) {
        alert("修改訂單狀態成功~ (((o(*ﾟ▽ﾟ*)o)))");
        getOrderList();
      });
    return;
  }

  // 刪除單筆訂單
  if (targetClass == "delSingleOrder-Btn") {
    axios
      .delete(`${base_url}/admin/${api_path}/orders/${id}`, {
        headers: {
          authorization: token,
        },
      })

      .then(function (response) {
        alert("刪除該筆訂單成功~ (•ㅂ•)/");
        getOrderList();
      });
    return;
  }
});

// 清空全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();

  axios
    .delete(`${base_url}/admin/${api_path}/orders`, {
      headers: {
        authorization: token,
      },
    })

    .then(function (response) {
      alert("呃...訂單全刪了... ( ＊゜ー゜)b");
      getOrderList();
    });
});

// C3.js
function renderC3() {
  // 資料蒐集
  let obj = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      const productName = productItem.title;
      const productNum = productItem.quantity;
      const productPrice = productItem.price;

      if (obj[productName] === undefined) {
        obj[productName] = productNum * productPrice;
      } else {
        obj[productName] += productNum * productPrice;
      }
    });
  });

  // 資料關聯
  let originAry = Object.keys(obj);
  let rankSortAry = [];

  originAry.forEach((item) => {
    let ary = [item, obj[item]];
    rankSortAry.push(ary);
  });

  // 比大小
  rankSortAry.sort(function (a, b) {
    return b[1] - a[1];
  });

  // 如果超過四筆，統整成其他
  if (rankSortAry.length > 3) {
    let otherTotal = 0;

    rankSortAry.forEach((item, index) => {
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    });

    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(["其他", otherTotal]);

    rankSortAry.sort(function (a, b) {
      return b[1] - a[1];
    });
  }

  // 產圓餅圖
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: rankSortAry,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}
