const { createApp } = Vue;

// App Component Template
const AppComponent = {
    template: `
        <div>
            <!-- Header -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <i class="fas fa-graduation-cap"></i> After-School Classes
                    </a>
                    <button class="btn btn-light ms-auto" @click="toggleView">
                        <i :class="showCart ? 'fas fa-book' : 'fas fa-shopping-cart'"></i>
                        {{ showCart ? 'View Lessons' : 'View Cart' }}
                        <span v-if="!showCart && cart.length > 0" class="badge bg-danger">{{ cart.length }}</span>
                    </button>
                </div>
            </nav>

            <!-- Lessons View -->
            <div v-if="!showCart" class="container my-4">
                <h2 class="mb-4">Available After-School Classes</h2>
                
                <!-- Search Box (Optional) -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input 
                                type="text" 
                                class="form-control" 
                                placeholder="Search lessons..."
                                v-model="searchQuery"
                                @input="searchLessons"
                            >
                        </div>
                    </div>
                </div>

                <!-- Sorting Controls -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <label class="form-label">Sort By:</label>
                        <select class="form-select" v-model="sortAttribute">
                            <option value="subject">Subject</option>
                            <option value="location">Location</option>
                            <option value="price">Price</option>
                            <option value="spaces">Available Spaces</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Order:</label>
                        <select class="form-select" v-model="sortOrder">
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>

                <!-- Lessons Grid -->
                <div class="row">
                    <div 
                        v-for="lesson in sortedLessons" 
                        :key="lesson._id" 
                        class="col-md-4 mb-4"
                    >
                        <div class="card lesson-card h-100">
                            <img 
                                :src="lesson.image" 
                                class="card-img-top lesson-image" 
                                :alt="lesson.subject"
                                @error="handleImageError"
                            >
                            <div class="card-body">
                                <h5 class="card-title">{{ lesson.subject }}</h5>
                                <p class="card-text">
                                    <i class="fas fa-map-marker-alt"></i> {{ lesson.location }}<br>
                                    <i class="fas fa-pound-sign"></i> {{ lesson.price }}<br>
                                    <i class="fas fa-users"></i> {{ lesson.spaces }} spaces available
                                </p>
                                <button 
                                    class="btn btn-primary w-100" 
                                    @click="addToCart(lesson)"
                                    :disabled="lesson.spaces === 0 || getAvailableSpaces(lesson) === 0"
                                >
                                    <i class="fas fa-cart-plus"></i>
                                    {{ getAvailableSpaces(lesson) === 0 ? 'Sold Out' : 'Add to Cart' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- No Results -->
                <div v-if="sortedLessons.length === 0" class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No lessons found.
                </div>
            </div>

            <!-- Cart View -->
            <div v-else class="container my-4">
                <h2 class="mb-4">Shopping Cart</h2>

                <!-- Cart Items -->
                <div v-if="cart.length > 0">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="card mb-3" v-for="(item, index) in cart" :key="index">
                                <div class="row g-0">
                                    <div class="col-md-3">
                                        <img 
                                            :src="item.image" 
                                            class="img-fluid rounded-start cart-image" 
                                            :alt="item.subject"
                                            @error="handleImageError"
                                        >
                                    </div>
                                    <div class="col-md-9">
                                        <div class="card-body">
                                            <h5 class="card-title">{{ item.subject }}</h5>
                                            <p class="card-text">
                                                <i class="fas fa-map-marker-alt"></i> {{ item.location }}<br>
                                                <i class="fas fa-pound-sign"></i> {{ item.price }}
                                            </p>
                                            <button 
                                                class="btn btn-danger btn-sm" 
                                                @click="removeFromCart(index)"
                                            >
                                                <i class="fas fa-trash"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Checkout Form -->
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Checkout</h5>
                                    <p><strong>Total Items:</strong> {{ cart.length }}</p>
                                    <p><strong>Total Price:</strong> £{{ totalPrice }}</p>
                                    
                                    <hr>
                                    
                                    <form @submit.prevent="submitOrder">
                                        <div class="mb-3">
                                            <label class="form-label">Name *</label>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                v-model="orderForm.name"
                                                @input="validateName"
                                                :class="{'is-invalid': nameError, 'is-valid': orderForm.name && !nameError}"
                                                placeholder="Enter your name"
                                                required
                                            >
                                            <div class="invalid-feedback">
                                                {{ nameError }}
                                            </div>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label class="form-label">Phone *</label>
                                            <input 
                                                type="text" 
                                                class="form-control" 
                                                v-model="orderForm.phone"
                                                @input="validatePhone"
                                                :class="{'is-invalid': phoneError, 'is-valid': orderForm.phone && !phoneError}"
                                                placeholder="Enter phone number"
                                                required
                                            >
                                            <div class="invalid-feedback">
                                                {{ phoneError }}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            class="btn btn-success w-100"
                                            :disabled="!isFormValid"
                                        >
                                            <i class="fas fa-check"></i> Complete Order
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty Cart -->
                <div v-else class="alert alert-info">
                    <i class="fas fa-shopping-cart"></i> Your cart is empty. Add some lessons to get started!
                </div>
            </div>

            <!-- Success Modal -->
            <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
                <div class="modal-content" @click.stop>
                    <div class="text-center">
                        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        <h3 class="mt-3">Order Successful!</h3>
                        <p>Your order has been placed successfully.</p>
                        <button class="btn btn-primary" @click="closeSuccessModal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    data() {
        return {
            lessons: [],
            cart: [],
            showCart: false,
            sortAttribute: 'subject',
            sortOrder: 'asc',
            searchQuery: '',
            orderForm: {
                name: '',
                phone: ''
            },
            nameError: '',
            phoneError: '',
            showSuccessModal: false,
            apiUrl: 'https://after-school-classes-booking-system.onrender.com' // Backend production URL
        };
    },

    computed: {
        sortedLessons() {
            let filtered = [...this.lessons];
            
            // Client-side search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(lesson => 
                    lesson.subject.toLowerCase().includes(query) ||
                    lesson.location.toLowerCase().includes(query)
                );
            }
            
            // Sort lessons
            filtered.sort((a, b) => {
                let aVal = a[this.sortAttribute];
                let bVal = b[this.sortAttribute];
                
                // Handle string comparison
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (this.sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
            
            return filtered;
        },

        totalPrice() {
            return this.cart.reduce((total, item) => total + item.price, 0).toFixed(2);
        },

        isFormValid() {
            return this.orderForm.name && 
                   this.orderForm.phone && 
                   !this.nameError && 
                   !this.phoneError &&
                   this.cart.length > 0;
        }
    },

    methods: {
        // Fetch lessons from backend
        fetchLessons() {
            // Load sample data first
            this.loadSampleData();
            
            // Then try to fetch from backend
            fetch(`${this.apiUrl}/lessons`)
                .then(response => {
                    if (!response.ok) throw new Error('Backend not available');
                    return response.json();
                })
                .then(data => {
                    if (data && data.length > 0) {
                        this.lessons = data;
                    }
                })
                .catch(error => {
                    console.log('Using sample data (backend not connected):', error.message);
                });
        },

        // Load sample data for testing without backend
        loadSampleData() {
            const baseImageUrl = 'https://after-school-classes-booking-system.onrender.com/images/';
            this.lessons = [
                { _id: '1', subject: 'Mathematics', location: 'Room 101', price: 25, spaces: 5, image: baseImageUrl + 'math.jpg' },
                { _id: '2', subject: 'English', location: 'Room 102', price: 20, spaces: 5, image: baseImageUrl + 'english.png' },
                { _id: '3', subject: 'Science', location: 'Lab 201', price: 30, spaces: 5, image: baseImageUrl + 'science.png' },
                { _id: '4', subject: 'Art', location: 'Studio A', price: 22, spaces: 5, image: baseImageUrl + 'art.jpg' },
                { _id: '5', subject: 'Music', location: 'Music Room', price: 28, spaces: 5, image: baseImageUrl + 'music.png' },
                { _id: '6', subject: 'Sports', location: 'Ground', price: 18, spaces: 5, image: baseImageUrl + 'sports.jpg' },
                { _id: '7', subject: 'Drama', location: 'Theater', price: 24, spaces: 5, image: baseImageUrl + 'drama.jpg' },
                { _id: '8', subject: 'Coding', location: 'Computer Lab', price: 35, spaces: 5, image: baseImageUrl + 'coding.png' },
                { _id: '9', subject: 'French', location: 'Room 103', price: 26, spaces: 5, image: baseImageUrl + 'french.jpg' },
                { _id: '10', subject: 'Chess', location: 'Room 104', price: 15, spaces: 5, image: baseImageUrl + 'chess.jpg' }
            ];
        },

        // Optional: Search lessons using backend
        searchLessons() {
            // This can be implemented to call backend search endpoint
            // For now, using client-side filtering in computed property
        },

        // Get available spaces for a lesson (considering cart)
        getAvailableSpaces(lesson) {
            const inCart = this.cart.filter(item => item._id === lesson._id).length;
            return lesson.spaces - inCart;
        },

        // Add lesson to cart
        addToCart(lesson) {
            const availableSpaces = this.getAvailableSpaces(lesson);
            
            if (availableSpaces > 0) {
                this.cart.push({ ...lesson });
                
                // Update spaces locally
                const lessonIndex = this.lessons.findIndex(l => l._id === lesson._id);
                if (lessonIndex !== -1) {
                    this.lessons[lessonIndex].spaces--;
                }
            }
        },

        // Remove item from cart
        removeFromCart(index) {
            const item = this.cart[index];
            
            // Restore space
            const lessonIndex = this.lessons.findIndex(l => l._id === item._id);
            if (lessonIndex !== -1) {
                this.lessons[lessonIndex].spaces++;
            }
            
            this.cart.splice(index, 1);
        },

        // Toggle between lessons and cart view
        toggleView() {
            this.showCart = !this.showCart;
        },

        // Validate name (letters and spaces only)
        validateName() {
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!this.orderForm.name) {
                this.nameError = 'Name is required';
            } else if (!nameRegex.test(this.orderForm.name)) {
                this.nameError = 'Name must contain only letters';
            } else {
                this.nameError = '';
            }
        },

        // Validate phone (digits only)
        validatePhone() {
            const phoneRegex = /^[0-9]+$/;
            if (!this.orderForm.phone) {
                this.phoneError = 'Phone is required';
            } else if (!phoneRegex.test(this.orderForm.phone)) {
                this.phoneError = 'Phone must contain only digits';
            } else {
                this.phoneError = '';
            }
        },

        // Submit order
        submitOrder() {
            if (!this.isFormValid) {
                return;
            }

            const orderData = {
                name: this.orderForm.name,
                phone: this.orderForm.phone,
                lessons: this.cart.map(item => ({
                    lessonId: item._id,
                    subject: item.subject,
                    price: item.price
                })),
                totalPrice: parseFloat(this.totalPrice)
            };

            // Submit to backend
            fetch(`${this.apiUrl}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Order submitted:', data);
                
                // Update lesson spaces on backend
                const updatePromises = this.cart.map(item => {
                    return fetch(`${this.apiUrl}/lessons/${item._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ spaces: item.spaces })
                    });
                });

                return Promise.all(updatePromises);
            })
            .then(() => {
                // Show success modal
                this.showSuccessModal = true;
                
                // Reset cart and form
                this.cart = [];
                this.orderForm.name = '';
                this.orderForm.phone = '';
                this.nameError = '';
                this.phoneError = '';
                
                // Refresh lessons
                this.fetchLessons();
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                alert('Error submitting order. Please try again.');
            });
        },

        // Close success modal
        closeSuccessModal() {
            this.showSuccessModal = false;
            this.showCart = false;
        },

        // Handle image loading error
        handleImageError(event) {
            event.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        }
    },

    mounted() {
        // Fetch lessons when component is mounted
        this.fetchLessons();
    }
};

// Create and mount Vue app
createApp(AppComponent).mount('#app');
