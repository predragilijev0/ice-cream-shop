var menu = [];
var allProducts = [];
var categories = [];
var url = window.location.href;

//function for fetching data from json
function fetchData(file, callback) {
	fetch("assets/data/" + file)
		.then(response => response.json())
		.then(data => callback(data))
		.catch(err => console.log(err));
}

function getAllProducts(data) {
	data.forEach(el => {
		allProducts.push(el);
		//console.log(el);
	});
	// console.log(allProducts);
	setItemToLS("allProducts", allProducts);
}
//local storage functions
function setItemToLS(name, data) {
	localStorage.setItem(name, JSON.stringify(data));
}

function getItemFromLS(name) {
	return JSON.parse(localStorage.getItem(name));
}

function removeItemFromLS(name) {
	return localStorage.removeItem(name);
}
//display functions global
function displayNav(data) {
	let html = "";
	data.forEach(el => {
		html += `<li class="nav-item">
		<a class="nav-link" href="${el.href}">${el.text}</a>
		</li>`;
		menu.push(el);
	});
	$("#menu").html(html);
}
//checking for any products in cart
function anyInCart() {
	return getItemFromLS("products");
}
//function for validating single input
function validateInput(regEx, element, err, errMess) {
	if (!$(element).val().match(regEx)) {
		$(element).addClass("error");
		$(err).html(errMess);
		return false;
	} else {
		$(element).removeClass("error");
		$(element).addClass("ok");
		$(err).html("");
		return true;
	}
}
//regex
var reName = /^[A-ZČĆŠĐŽ][a-zčćšđž]{2,19}(\s[A-ZČĆŠĐŽ][a-zčćšđž]{2,19})*$/;
var reEmail = /^[\w\.\-]+\@([a-z0-9]+\.)+[a-z]{2,3}$/;
var reSubject = /^([1-zćčžđšA-ZČĆŠĐŽ0-1@.\s]{2,20})$/;
var reAddress = /^([A-ZČĆŠĐŽ]|[1-9]{1,5})[A-ZČĆŠĐŽa-zčćšđž\d\-\.\s]+$/;
var reMessage = /^([1-zćčžđšA-ZČĆŠĐŽ0-1@.\s]{2,255})$/;
var reAddress = /^([A-ZČĆŠĐŽ]|[1-9]{1,5})[A-ZČĆŠĐŽa-zčćšđž\d\-\.\s]+$/;
var reCreditCard = /^[0-9]{16}$/;
var messName = "Name must begin with capital letter";
var messEmail = "Email must contain @ sign";
var messSubject = "Subject can contain 20 characters";
var messMessage = "Message can contain 255 characters";
var messAddress = "Please eneter your address";
var messCreditCard = "Credit card contains 16 digits";
window.onload = function() {
	try {
		fetchData("nav.json", displayNav);
		fetchData("products.json", getAllProducts);
	} catch (e) {
		$(".error").html(e.message());
	}

	if (url == "http://127.0.0.1:5500/shop.html") {
	// if (url == "http://localhost/wp2sajt1/shop.html") {
		//if (url == "https://safirawp2.netlify.app/shop.html") {
		try {
			fetchData("categories.json", displayCategories);
			fetchData("products.json", displayProducts);
		} catch (e) {
			$(".error").html(e.message);
		}
		$("#sort").change(filterChange);
		$("#search").keyup(filterChange);

		function filterChange() {
			fetchData("products.json", displayProducts);
		}
		//display functions
		function displayCategories(data) {
			let html = "";
			data.forEach(el => {
				html += `<li class="list-group-item">
				<input type="checkbox" value="${el.id}" class="category"
				name="categories"/> ${el.name}
				</li>`;
				categories.push(el);
			});
			$("#categories").html(html);
			$('.category').change(filterChange);
		}

		function displayProducts(data) {
			data = filterByCategory(data);
			data = sorting(data);
			data = search(data);
			let html = "";
			if (data.length == 0) {
				html += `<p class="alert alert-danger">There is no products for selected category</p>`;
			} else {
				data.forEach(el => {
					html += `<div class="col-lg-4 col-sm-6 mb-5 mt-lg-0 mt-5">
                    <div class="card text-center">
                        <img src="img/${el.image.src}" class="card-img-top p-3" alt="${el.name}">
                        <div class="card-body">
                          <h5 class="card-title font-weight-bold">${el.name}</h5>
                          <p class="card-text">${el.price.new} RSD</p>
						  <del>${el.price.old} RSD</del>
						  <p class="card-text">${stars(el.stars)}</p>
						  <button type="button" class="btn btn-dark btnCart" data-id="${el.id}" data-toggle="modal" data-target="#exampleModal">Dodaj u korpu</button>                        
						  </div>
                    </div>
                </div>`;
				});
			}
			$("#products").html(html);
			$(".btnCart").on("click", addToCart);
		}

		function stars(data) {
			let html = "";
			for (let i = 0; i < data; i++) {
				html += `<i class="fas fa-star"></i>`;
			}
			for (let i = 0; i < 5 - data; i++) {
				html += `<i class="far fa-star"></i>`;
			}
			return html;
		}

		function filterByCategory(data) {
			let selectedCategories = [];
			$('.category:checked').each(function(el) {
				selectedCategories.push(parseInt($(this).val()));
			});
			if (selectedCategories.length != 0) {
				return data.filter(x => selectedCategories.includes(x.categoryID));
			}
			return data;
		}

		function sorting(data) {
			let sortingType = $("#sort").val();
			if (sortingType == 'ascName') {
				return data.sort((a, b) => a.name > b.name ? 1 : -1);
			} else if (sortingType == 'descName') {
				return data.sort((a, b) => a.name < b.name ? 1 : -1);
			} else if (sortingType == 'ascPrice') {
				return data.sort((a, b) => a.price.new > b.price.new ? 1 : -1);
			} else if (sortingType == 'descPrice') {
				return data.sort((a, b) => a.price.new < b.price.new ? 1 : -1);
			} else if (sortingType == 'ascRates') {
				return data.sort((a, b) => a.stars > b.stars ? 1 : -1);
			} else if (sortingType == 'descRates') {
				return data.sort((a, b) => a.stars < b.stars ? 1 : -1);
			}
		}

		function search(data) {
			let searchValue = $("#search").val().toLowerCase();
			if (searchValue) {
				return data.filter(function(el) {
					return el.name.toLowerCase().indexOf(searchValue) !== -1;
				})
			}
			return data;
		}
		//function addToCart
		function addToCart() {
			var id = $(this).data('id');
			var productsLS = anyInCart();
			if (!productsLS) {
				let productsLS = [];
				productsLS[0] = { //adding the first one
					id: id,
					quantity: 1
				};
				setItemToLS("products", productsLS);
			} else {
				if (!findInLocalStorage(productsLS, id)) {
					addToLocalStorage(id) //adding the different one
					//console.log("tu")
				} else {
					updateQuantity(id); //if product alrady exist in cart, updating quantity
				}
			}
		}
		//finding product in local storage
		function findInLocalStorage(prod, id) {
			return prod.find(p => p.id == id);
		}
		//adding product in cart
		function addToLocalStorage(id) {
			let productsLS = anyInCart();
			productsLS.push({
				id: id,
				quantity: 1
			});
			setItemToLS("products", productsLS);
		}
		//if product already exist in cart, update quantity
		function updateQuantity(id) {
			let productsLS = anyInCart();
			productsLS.forEach(el => {
				if (el.id == id)
					el.quantity++;
			});
			setItemToLS("products", productsLS);
		}
	}
	if (url == "http://127.0.0.1:5500/cart.html") {
	// if (url == "http://localhost/wp2sajt1/cart.html") {
		//if (url == "https://safirawp2.netlify.app/cart.html") {
		function displayCart() {
			let html = `
				<div id="orderTable">
				<table class="table table-responsive">
				<thead>
				<tr>
				<td>Ime sladoleda</td>
				<td>Slika</td>
				<td>Cena</td>
				<td>Kolicina</td>
				<td>Suma</td>
				</tr>
				</thead>`;
			let productsLS = getItemFromLS("products");
			var products = getItemFromLS("allProducts");
			// console.log(productsLS);
			// console.log(products);
			products = products.filter(el => {
				for (let p of productsLS) {
					if (el.id == p.id) {
						el.quantity = p.quantity;
						return true;
					}
				}
			});
			products.forEach(el => {
				html += `<tbody>
							<tr>
								<td><p>${el.name}</h5></p>
								<td>
									<img src="img/${el.image.src}" alt="${el.name}" class="img-thumbnail"
									width="100"/>
								</td>
								<td class="price">${el.price.new} RSD</td>
								<td class="quantity">
									<input class="formcontrol quantityInput" type="number" value="${el.quantity}">
								</td>
								<td class="productSum">${parseFloat(el.price.new * el.quantity)} RSD</td>
							</tr>
						</tbody>`;
			});
			html += `<table>
			</div>
			<div class="container">
			<div class="row d-flex justify-content-end" id="controls">
			<p id="totalSum" class="m-2">Totalna suma: ${sum(products)} RSD</p>
			<button id="purchase" class="btn btn-primary m-2">Kupi</button>
			<button id="removeAll" class="btn btn-dark m-2">Izbrisi sve</button>
			</div>
			</div>`;
			$("#cart").html(html);
			$("#purchase").click(validateCart);
			$("#removeAll").click(removeAll);
		}
		//calculating total price of one product in cart
		function sum(data) {
			let sum = 0;
			data.forEach(el => {
				sum += parseFloat(el.price.new * el.quantity);
			});
			return sum;
		}
		check(getItemFromLS("products"));
		//function for checking if there is any products in cart
		function check(productsInCart) {
			if (productsInCart) {
				if (productsInCart.length) {
					displayCart();
					$(".quantityInput").change(quantityChange);
				} else
					showEmptyCart();
			} else
				showEmptyCart();
		}

		function showEmptyCart() {
			$("#cart").html("<p class='text-center p-5 alert-danger'>Nema proizvoda u korpi</p>");
		}

		function removeAll() {
			removeItemFromLS("products");
			location.reload();
		}

		function update() {
			var productSum = document.querySelectorAll(".productSum");
			var price = document.querySelectorAll(".price");
			var quantitySum = document.querySelectorAll(".quantityInput");
			var totalSumforAll = document.querySelector("#totalSum");
			var totalSumForOne = 0;
			for (let i = 0; i < price.length; i++) {
				var priceone = price[i].innerHTML.replace('$', '');
				productSum[i].innerHTML = (Number(priceone) * Number(quantitySum[i].value)).toFixed(2) +
					"$";
				totalSumForOne += Number(priceone) * Number(quantitySum[i].value);
			}
			totalSumforAll.innerHTML = "Total Sum:" + parseFloat(totalSumForOne).toFixed(2) + "$";
		}

		function quantityChange() {
			if (this.value > 0) {
				update();
			} else {
				this.value = 1;
			}
		}
		$("#ordername").blur(function() {
			validateInput(reName, "#ordername", "#errOrderName", messName);
		});
		$("#address").blur(function() {
			validateInput(reAddress, "#address", "#errAddress", messAddress);
		});
		$("#credit-card").blur(function() {
			validateInput(reCreditCard, "#credit-card", "#errCreditCard", messCreditCard);
		});

		function validateCart() {
			var errors1 = 0;
			if (!validateInput(reName, "#ordername", "#errOrderName", messName)) {
				errors1++;
			}
			if (!validateInput(reAddress, "#address", "#errAddress", messAddress)) {
				errors1++;
			}
			if (!validateInput(reCreditCard, "#credit-card", "#errCreditCard", messCreditCard)) {
				errors1++;
			} else {
				if (errors1 == 0) {
					console.log('upalo');
					return buy();
				}
			}
		}

		function buy() {
			localStorage.removeItem("products");
			showEmptyCart();
			$("#cart").html("<p class='alert-success p-5'>Your order has been placed</p>");
		}
	}
	if (url == "http://127.0.0.1:5500/contact.html") {
        // console.log("stranica contact")
	// if (url == "http://localhost/wp2sajt1/contact.html") {
		//if (url == "https://safirawp2.netlify.app/contact.html") {
		$("#name").blur(function() {
			validateInput(reName, "#name", "#errName", messName);
		});
		$("#email").blur(function() {
			validateInput(reEmail, "#email", "#errEmail", messEmail);
		});
		$("#subject").blur(function() {
			validateInput(reSubject, "#subject", "#errSubject", messSubject);
		});
		$("#message").blur(function() {
			validateInput(reMessage, "#message", "#errMessage", messMessage);
		});
		var inputName = $("#name");
		var inputEmail = $("#email");
		var inputSubject = $("#subject");
		var inputMessage = $("#message");
        // console.log("forma");
		$("#form-submit").click(validateForm);
		var errors = 0;

		function validateForm() {
			if (!validateInput(reName, inputName, "#errName", messName)) {
				errors++;
			}
			if (!validateInput(reEmail, inputEmail, "#errEmail", messEmail)) {
				errors++;
			}
			if (!validateInput(reSubject, inputSubject, "#errSubject", messSubject)) {
				errors++;
			}
			if (!validateInput(reMessage, inputMessage, "#errMessage", messMessage)) {
				errors++;
			} else {
				errors = 0;
			}
			console.log(errors);
			if (errors == 0) {
				$("#response").html("<p class='alert alert-success'>Your message was sent</p>")
			}
		}
		$("#form-submit").click(validateForm);
	}
}