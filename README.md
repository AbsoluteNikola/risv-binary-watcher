# risc-v-binary-watcher

## Утилита командной строки

### Загрузка:

```shell
curl -L https://github.com/AbsoluteNikola/risv-binary-watcher/releases/download/{VERSION}/binary_watcher -o ./binary_watcher
```

_Акуальная версия v0.0.1-analyzer, бинарник для GNU Linux x86-64_

### Использование
```shell
./binary_watcher имя_пакета папка для вывода результата
```

В stdout выведется JSON предсталвение графа. Его необходимо загрузить в виде файла во Viewer

## Viewer

Загрузка образа, создание и запуск контейнера:
```shell
docker run -p 8080:8080 -it  ghcr.io/absolutenikola/risv-binary-watcher:release
```

_веб-сервер будет запущен на порте 8080, подключиться можно по URL http://localhost:8080_

Необходимо загрузить файл, полученный из утилиты командной строки, на эту веб-страницу. Для этого
необходимо воспрользоваться кнопкой Upload File:

![upload_button.png](imgs/upload_button.png)

В результате загрузится граф:

![ui-example.png](imgs/ui-example.png)