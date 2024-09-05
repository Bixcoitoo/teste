// Importação dos módulos de produtos
import { smartphones } from './produtos/smartphones.js';
import { notebooks } from './produtos/notebooks.js';
import { tvs } from './produtos/tvs.js';
import { acessorios } from './produtos/acessorios.js';
import { cameras } from './produtos/cameras.js';
import { tablets } from './produtos/tablets.js';
import { audio } from './produtos/audio.js';

// Combinação de todos os produtos em um único array
const produtos = [...smartphones, ...notebooks, ...tvs, ...acessorios, ...cameras, ...tablets, ...audio];

// Função para gerar um produto
function gerarProduto(nome, preco, descricao, imagem, categoria) {
    return {
        nome,
        preco,
        descricao,
        imagem,
        categoria
    };
}

// Função para criar o HTML de um card de produto
function criarCardProduto(produto) {
    return `
        <div class="product">
            <img src="placeholder.jpg" data-src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
            <h3>${produto.nome}</h3>
            <p class="price">${produto.preco}</p>
            <p>${produto.descricao}</p>
            <div class="product-actions">
                <a href="#" class="btn cart-btn">Adicionar ao Carrinho</a>
                <a href="produto-${produto.nome.toLowerCase().replace(/\s+/g, '-')}.html" class="btn">Comprar Agora</a>
            </div>
        </div>
    `;
}

// Função para criar o HTML de uma seção de categoria
function criarSecaoCategoria(categoria, produtosCategoria) {
    return `
        <div class="category-section" id="${categoria.toLowerCase()}">
            <h2 class="category-title">${categoria}</h2>
            <div class="products-carousel">
                <button class="carousel-btn prev-btn">&lt;</button>
                <div class="products-grid">
                    ${produtosCategoria.map(produto => criarCardProduto(produto)).join('')}
                </div>
                <button class="carousel-btn next-btn">&gt;</button>
            </div>
        </div>
    `;
}

// Função para exibir produtos por categoria
function exibirProdutosPorCategoria(produtosFiltrados = produtos) {
    const containerProdutos = document.getElementById('products-container');
    containerProdutos.innerHTML = '';

    const categorias = [...new Set(produtosFiltrados.map(produto => produto.categoria))];

    categorias.forEach(categoria => {
        const produtosCategoria = produtosFiltrados.filter(produto => produto.categoria === categoria);
        if (produtosCategoria.length > 0) {
            containerProdutos.innerHTML += criarSecaoCategoria(categoria, produtosCategoria);
        }
    });

    // Adicionar event listeners para os botões do carrossel
    document.querySelectorAll('.category-section').forEach(section => {
        updateCarousel(section, 3);
    });

    // Implementar lazy loading para imagens
    const imagens = document.querySelectorAll('img[data-src]');
    const observador = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    imagens.forEach(img => observador.observe(img));
}

// Função para filtrar produtos
function filtrarProdutos(termoPesquisa) {
    return produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termoPesquisa) || 
        produto.descricao.toLowerCase().includes(termoPesquisa)
    );
}

// Variável global para armazenar os produtos filtrados atuais
let produtosFiltradosAtual = produtos;

// Event listener para o formulário de pesquisa
document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const termoPesquisa = document.getElementById('search-input').value.trim().toLowerCase();
    if (termoPesquisa.length > 0) {
        produtosFiltradosAtual = filtrarProdutos(termoPesquisa);
        exibirProdutosPorCategoria(produtosFiltradosAtual);
    }
});

// Função para alternar o menu móvel
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('active');
    
    // Ajusta o scroll para o topo da página quando o menu é aberto
    if (nav.classList.contains('active')) {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

// Função para ajustar o carrossel com base no tamanho da tela
function adjustCarousel() {
    const windowWidth = window.innerWidth;
    let productsPerPage = 3;

    if (windowWidth < 768) {
        productsPerPage = 1;
    } else if (windowWidth < 992) {
        productsPerPage = 2;
    }

    document.querySelectorAll('.category-section').forEach(section => {
        const productsGrid = section.querySelector('.products-grid');
        const produtos = section.querySelectorAll('.product');
        
        produtos.forEach(produto => {
            produto.style.flex = `0 0 ${100 / productsPerPage}%`;
        });

        // Reinicializar o carrossel
        updateCarousel(section, productsPerPage);
    });
}

// Atualizar a função updateCarousel para aceitar a seção e o número de produtos por página
function updateCarousel(section, productsPerPage) {
    const productsGrid = section.querySelector('.products-grid');
    const produtos = section.querySelectorAll('.product');
    let currentIndex = 0;

    function update() {
        const translateX = -currentIndex * (100 / productsPerPage);
        productsGrid.style.transform = `translateX(${translateX}%)`;
    }

    section.querySelector('.prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            update();
        }
    });

    section.querySelector('.next-btn').addEventListener('click', () => {
        if (currentIndex < produtos.length - productsPerPage) {
            currentIndex++;
            update();
        }
    });

    update();
}

// Adicionar event listener para redimensionamento da janela
window.addEventListener('resize', adjustCarousel);

// Função para rolar suavemente até a seção da categoria
function scrollToCategory(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para obter localização automática
function obterLocalizacaoAutomatica() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(response => response.json())
                .then(data => {
                    const endereco = data.address;
                    const cidade = endereco.city || endereco.town || endereco.village || 'Cidade desconhecida';
                    const estado = endereco.state || 'Estado desconhecido';
                    
                    document.getElementById('cep-display').textContent = `${cidade}, ${estado}`;
                    buscarCEPPorEndereco(cidade, estado);
                })
                .catch(error => {
                    console.error("Erro ao obter endereço:", error);
                    document.getElementById('cep-display').textContent = "Localização não encontrada";
                });
        }, function(error) {
            console.error("Erro ao obter geolocalização:", error);
            document.getElementById('cep-display').textContent = "Localização não disponível";
        });
    } else {
        console.log("Geolocalização não é suportada neste navegador.");
        document.getElementById('cep-display').textContent = "Geolocalização não suportada";
    }
}

function buscarCEPPorEndereco(cidade, estado) {
    // Usando a API do ViaCEP para buscar o CEP
    fetch(`https://viacep.com.br/ws/${estado}/${cidade}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Pegamos o primeiro CEP da lista (você pode implementar uma lógica mais complexa se necessário)
                const cep = data[0].cep;
                document.getElementById('cep-display').textContent = `${cidade}, ${estado} - CEP: ${cep}`;
            } else {
                console.log("Nenhum CEP encontrado para esta localização.");
                document.getElementById('cep-display').textContent = `${cidade}, ${estado}`;
            }
        })
        .catch(error => {
            console.error("Erro ao buscar CEP:", error);
            document.getElementById('cep-display').textContent = `${cidade}, ${estado}`;
        });
}

// Função para buscar endereço pelo CEP
function buscarEndereco(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('cep-display').textContent = `${data.localidade}, ${data.uf}`;
            } else {
                alert('CEP não encontrado');
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            alert('Erro ao buscar CEP');
        });
}

// Inicialização: adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');
    
    try {
        exibirProdutosPorCategoria();
        adjustCarousel();
        
        // Adicionar event listeners para os links de categoria
        const categoryLinks = document.querySelectorAll('#main-nav a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', scrollToCategory);
        });

        // Adicionar event listener para o botão menu-toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        } else {
            console.error('Elemento menu-toggle não encontrado');
        }

        // Ajusta o zoom inicial
        document.body.style.zoom = "100%";

        // Adicionar funcionalidade para o CEP
        const cepDisplay = document.getElementById('cep-display');
        if (cepDisplay) {
            cepDisplay.addEventListener('click', function() {
                const cep = prompt('Digite seu CEP:');
                if (cep) {
                    buscarEndereco(cep);
                }
            });
        }

        // Adicionar event listener para o botão de atualização de localização
        const atualizarLocalizacaoBtn = document.getElementById('atualizar-localizacao');
        if (atualizarLocalizacaoBtn) {
            atualizarLocalizacaoBtn.addEventListener('click', obterLocalizacaoAutomatica);
        }

        // Chamar a função de obter localização automática quando a página carregar
        obterLocalizacaoAutomatica();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
});

// Fechar o menu móvel quando um link é clicado
document.querySelectorAll('#main-nav a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.getElementById('main-nav');
        nav.classList.remove('active');
    });
});