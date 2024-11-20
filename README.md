<p align="center">
    <img src="https://github.com/MarcelSecco1/Inertia-Laravel-React/assets/88053611/cef068da-172f-48e8-8827-8154fc989ed2" heigth="300" width="300">
</p>

## Sobre o projeto:

Essa aplicação é um simples CRUD de usuário utilizando tecnologias como o Inertia, unindo o Laravel com o React, sem ser consumindo uma API.

## Tecnologias utilizadas:

- Laravel
- React
- Typescript
- TailwindCSS
- Docker
- MySQL

Tornando a aplicação extremamente escalável e reutilizável.

## Como utilizar esse projeto de maneira local:

#### Pré requisitos:
- Docker
- Composer
- Npm ou similares

  
Primeiro clome o repositório:
```bash
  git clone https://github.com/MarcelSecco1/Inertia-Laravel-React.git
```

Após o clone:
```bash
  cd Inertia-Laravel-React
```

Após entrar no projeto, execute os dois comandos:
```bash
  npm install
  npm run dev
```

Seguindo, basta instalar as dependencias do composer:
```bash
  composer install
```

Por fim, copie o .env.example:
```bash
  cp .env.example .env
```

Como último método, execute:
```bash
 ./bin/vendor/sail up
```

Seu projeto estará disponível em:
[http://localhost](http://localhost)


## License

 [MIT license](https://opensource.org/licenses/MIT).
