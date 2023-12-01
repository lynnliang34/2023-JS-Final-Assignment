// 初始畫面
function init() {
  getProductList();
  getCartList();
}
init();

// 跟後台取得產品資料
let productData = [];
const productList = document.querySelector(".productWrap");

function getProductList() {
  axios
    .get(`${base_url}/customer/${api_path}/products`)

    .then(function (response) {
      productData = response.data.products;
      renderProudctList();
    });
}

// 組合產品 <li> 字串
function combineProudctHTMLItem(item) {
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${item.images}"
            alt="${item.title}圖片"
          />
          <a href="#" class="addCardBtn" proudut-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${addThousandths(item.origin_price)}</del>
          <p class="nowPrice">NT$${addThousandths(item.price)}</p>
          </li>`;
}

// 全部產品清單
function renderProudctList() {
  let str = "";

  productData.forEach((item) => {
    str += combineProudctHTMLItem(item);
  });

  productList.innerHTML = str;
}

// 篩選產品類別
const productSelect = document.querySelector(".productSelect");

productSelect.addEventListener("change", function (e) {
  const category = e.target.value;

  if (category == "全部") {
    renderProudctList();
    return;
  }

  let str = "";

  productData.forEach((item) => {
    if (category == item.category) {
      str += combineProudctHTMLItem(item);
    }
  });

  productList.innerHTML = str;
});

// 加入購物車
let cartData = [];
const cartList = document.querySelector(".shoppingCart-tableList");

productList.addEventListener("click", function (e) {
  e.preventDefault();
  const proudutId = e.target.getAttribute("proudut-id");

  if (proudutId == null) {
    return;
  }

  let newNum = 1;
  cartData.forEach((item) => {
    if (proudutId === item.product.id) {
      newNum = item.quantity += 1;
    }
  });

  axios
    .post(`${base_url}/customer/${api_path}/carts`, {
      data: {
        productId: proudutId,
        quantity: newNum,
      },
    })
    .then(function (response) {
      alert("已加入購物車！ヽ(●´∀`●)ﾉ");
      getCartList();
    });
});

// 跟後台取得購物車資料
function getCartList() {
  axios
    .get(`${base_url}/customer/${api_path}/carts`)

    .then(function (response) {
      const totalAmount = document.querySelector(".total-amount");
      totalAmount.innerHTML = `NT$${addThousandths(response.data.finalTotal)}`;

      cartData = response.data.carts;

      let str = "";

      cartData.forEach((item) => {
        str += `<tr>
                <td>
                  <div class="cardItem-title">
                    <img src="${item.product.images}" 
                         alt="${item.product.title}圖片" />
                    <p>${item.product.title}</p>
                  </div>
                </td>
                <td>NT$${addThousandths(item.product.price)}</td>
                <td> 
                  <a href="#" class="material-symbols-outlined"
                     style="font-size: medium; text-decoration: none;"
                     quantity="minus" changeNum-cart-id="${item.id}">
                     do_not_disturb_on
                  </a>  ${
                    item.quantity
                  }  <a href="#" class="material-symbols-outlined" 
                        style="font-size: medium; text-decoration: none;"
                        quantity="plus" changeNum-cart-id="${item.id}">
                        add_circle
                     </a>
                </td>
                <td>NT$${addThousandths(
                  item.product.price * item.quantity
                )}</td>
                <td class="discardBtn">
                  <a href="#" class="material-icons" cart-id="${
                    item.id
                  }"> clear </a>
                </td>
                </tr>`;
      });

      if (cartData.length == 0) {
        str = `<tr>
                <td>
                  <p>快買呀~ (ﾉ,,・ω・)ﾉ</p>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
               </tr>`;
      }

      cartList.innerHTML = str;
    });
}

// 購物車：更改訂購數量、刪除單筆訂單
cartList.addEventListener("click", function (e) {
  e.preventDefault();

  const changeNumCartId = e.target.getAttribute("changeNum-cart-id");
  const quantity = e.target.getAttribute("quantity");
  const cartId = e.target.getAttribute("cart-id");

  if (quantity == null && cartId == null) {
    return;
  } else if (quantity !== null) {
    let changeNum = 1;

    cartData.forEach((item) => {
      if (quantity == "plus" && changeNumCartId == item.id) {
        changeNum = item.quantity += 1;
      } else if (quantity == "minus" && changeNumCartId == item.id) {
        if (item.quantity == 1) {
          alert("產品數量不可小於 1 RRR ((((；゜Д゜)))");
          return;
        }
        changeNum = item.quantity -= 1;
      }
    });

    axios
      .patch(`${base_url}/customer/${api_path}/carts/`, {
        data: {
          id: changeNumCartId,
          quantity: changeNum,
        },
      })

      .then(function (response) {
        console.log("(／・ω・)／ 修改數量成功~");
        getCartList();
      });
  } else if (cartId !== null) {
    axios
      .delete(`${base_url}/customer/${api_path}/carts/${cartId}`)

      .then(function (response) {
        alert("刪除該筆訂單成功~ (๑´ㅂ`๑)");
        getCartList();
      });
  }
});

// 清空購物車
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(`${base_url}/customer/${api_path}/carts`)

    .then(function (response) {
      alert("清空購物車成功~ (,,・ω・,,)");
      getCartList();
    });
});

// 驗證表單
const formConstraints = {
  姓名: {
    presence: { message: "必填 ( ˘•ω•˘ )" },
  },
  電話: {
    presence: { message: "必填 ( ˘•ω•˘ )" },
    format: {
      pattern: "^0[0-9]*",
      message: "( ˘･з･) 請輸入 0 開頭的數字",
    },
    length: {
      minimum: 9,
      maximum: 10,
      message: "(｡ŏ_ŏ) 請輸入手機 9 碼，或是市話加區號 9~10 碼",
    },
  },
  Email: {
    presence: { message: "必填 ( ˘•ω•˘ )" },
    email: { message: "(｡ŏ_ŏ) 請檢察格式" },
  },
  寄送地址: {
    presence: { message: "必填 ( ˘•ω•˘ )" },
  },
};

const orderInfoForm = document.querySelector(".orderInfo-form");
const orderInfoInput = document.querySelectorAll(".orderInfo-input");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");

orderInfoInput.forEach((item) => {
  item.addEventListener("blur", function (e) {
    orderInfoMessage.forEach((message) => {
      const error = validate(orderInfoForm, formConstraints);
      if (error == undefined) {
        message.innerHTML = "";
        return;
      }

      const targetName = e.target.getAttribute("name");
      const messageName = message.getAttribute("data-message");
      const errorMessaage = error[targetName];

      if (targetName == messageName) {
        if (errorMessaage == undefined) {
          message.innerHTML = "";
          return;
        } else {
          let newErrorMessage = "";
          const attributeLength = targetName.length + 1;

          errorMessaage.forEach((str, index) => {
            if (index > 0) {
              newErrorMessage += "、";
            }
            newErrorMessage += str.slice(attributeLength);
          });

          message.innerHTML = newErrorMessage;
        }
      }
    });
  });
});

// 送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("購物車是空的欸 ( ㅍ_ㅍ )？");
    return;
  } else if (validate(orderInfoForm, formConstraints) !== undefined) {
    alert("(  ´･д･｀)ノ 請填寫正確預訂資料！");
    return;
  } else {
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;

    axios
      .post(`${base_url}/customer/${api_path}/orders`, {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      })

      .then(function (response) {
        alert("送出訂單成功~ ( ๑•̀ㅂ•́)و✧");
        orderInfoForm.reset();
        getCartList();
      });
  }
});
