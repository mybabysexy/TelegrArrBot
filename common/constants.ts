export const MEOWS = [
    {
        type: "html",
        value: `<b>Meow 😺</b>`,
    },
    {
        type: "sticker",
        value: "CAACAgUAAxkBAAOOZHBJ6NUJaN1lOBI69xRjCd0UxSwAAmgFAALrREFXPhOBAAH1CIR1LwQ",
    },
    {
        type: "sticker",
        value: "CAACAgUAAxkBAAOeZHBVo-1ooCOlf0bAvrDwjLbVblgAAoMHAAJjpHhU1xtbtj6M0kkvBA",
    },
    {
        type: "sticker",
        value: "CAACAgUAAxkBAAOgZHBVwm89IGkIcljMJAftkTF38DEAAg0IAAJlS0BXoc56AuW6hTQvBA",
    },
    {
        type: "sticker",
        value: "CAACAgUAAxkBAAO1ZHBWaFO2WOUGwbIx8aYOLb_t8SkAAhIEAAJ54elXg0sBXH4DYwYvBA",
    },
    {
        type: "sticker",
        value: "CAACAgUAAxkBAAO2ZHBWfv_kB-jUli9HKCyVyN2Cv08AAtgDAAKyB-hXOdS-wZE5YrkvBA",
    },
    {
        type: "sticker",
        value: "CAACAgQAAxkBAAO3ZHBWv-XHUfAB-rhNToPJhcjH_gMAAjIAA845CA0xEiWtnrjMji8E",
    },
]

export const ML_BAU = [
    "CAACAgUAAxkBAAPeZHC7g2YlKdQp_R5Cj_h6Hk-a6EQAAk8JAAIXmIBXBQQzI5VMbpIvBA",
    "CAACAgUAAxkBAAPdZHC7ghXBsgeAuHgr5pNK6_x-NXsAAjgIAALTsYhXhRY-djUvfi4vBA",
    "CAACAgUAAxkBAAPcZHC7gTpECyixJjynTIJ18cqLofIAAo0JAAI0eIhXAvpjg2cIqrMvBA",
    "CAACAgUAAxkBAAPbZHC7gM4gEn5X0wTeZwSnKBimjFkAAhILAAKrA4FXaQgT5iXN2vYvBA",
    "CAACAgUAAxkBAAPaZHC7f4otCeco-XxoYzGQJlCCi1UAAqMMAAL284hXEVsuZ7tsNwcvBA",
    "CAACAgUAAxkBAAPZZHC7f6ZZ8ygmUgSiAc1RaBDRPicAAtwKAAJqSIhXF0OnGKAjfLsvBA",
    "CAACAgUAAxkBAAPYZHC7fSQU3Il2zKsuNdvsCnshPWQAAh4HAAKL_YlXfpb8PzYFwowvBA",
    "CAACAgUAAxkBAAPXZHC7fKsPsbfxt39hrE7FlVG4fAUAAmwNAAJNUYlXvsDukDHn1hAvBA",
    "CAACAgUAAxkBAAPWZHC7e33em1-T__gMnwaFD4fyyqoAAs4JAAKHxIlXR0iykKHMe2AvBA"
]

export const REPLIES = {
    OUT_OF_MOVIES_INDEX: "Hết phim rồi!",
    NO_MOVIES_FOUND: "Không tìm thấy phim nào!",
    TMDB_ID_NOT_FOUND: "Không tìm thấy phim trên TMDB",
    IMDB_ID_NOT_FOUND: "Không tìm thấy phim trên IMDB",
    QUALITY_PROFILE_NOT_FOUND: "Không tìm thấy profile!",
    NO_MOVIES_IN_QUEUE: "Không có phim nào đang tải!",
    MOVIE_ALREADY_DOWNLOADED: "Phim đã được tải!",
    ERROR(err: Error) {
        return `Đã xảy ra lỗi: ${err.message}`
    },
}

export const QUEUE_STATUS = {
    DOWNLOADING: "Đang tải",
    PAUSED: "Tạm dừng",
    QUEUED: "Đang chờ",
    UNKNOWN: "Không xác định",
    COMPLETE: "Hoàn thành",
    SEEDING: "Đang chia sẻ",
    ERROR: "Lỗi",
    STALL: "Không có kết nối",
}

export const BUTTON_TEXTS = {
    DOWNLOAD_MOVIE: "Tải phim",
    DELETE_MOVIE: "Xóa phim",

}
