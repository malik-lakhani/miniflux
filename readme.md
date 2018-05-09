# Miniflux Rss Reader

## Prerequisites
* [Docker/Docker-Compose >=  18.03.1-ce/1.21.1](https://www.docker.com/)
* [Node.js >= 8.10.0/NPM](http://nodejs.org/download/)

## Setup Miniflux

Clone project

```
ssh://git@192.168.1.5:2222/malik_lakhani/miniflux.git
```

Give executable permission to `setup.sh` file

```
chmod +x setup.sh
```

Run setup.sh executable

```
sh setup.sh
```
or 

```
sh setup.sh up
```

Create migration for miniflux

```
docker exec -ti <container id> /usr/local/bin/miniflux -migrate
```

Create Admin user for miniflux

```
docker exec -ti <container id> /usr/local/bin/miniflux -create-admin
```


Note:- migration and admin user create commands should be executed for only once.

Access the miniflux application at `{ip(127.0.0.1)}:{miniflux port(80)}`


## Setup Program to get Feeds

Create .env file

```
Create .env file. (reference from example.env)
```

Install dependencies

```
npm install
```

Run Program to generate CSV of feeds that matches the given pattern/regex.

```
node index.js <pattern>
```
Note:- You don't have to use case insensitive parameter (/i) in your regex/pattern. System will automatically add it.