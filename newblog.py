# coding=utf-8
import os
import datetime
import subprocess
from slugify import slugify

def create_blog_post():
    """
    交互式地创建一篇博客文章的 .mdx 文件，并自动打开。
    """
    print("--- 博客文章生成器 ---")

    # 1. 获取文章标题
    title = input("请输入文章标题: ")
    if not title:
        print("标题不能为空，已取消操作。")
        return

    # 2. 获取标签
    tags_input = input("请输入标签（多个标签用英文逗号,分隔）: ")
    tags = [tag.strip().strip('"') for tag in tags_input.split(',') if tag.strip()]

    # 3. 生成日期和文件名
    today = datetime.date.today()
    year = today.year
    month = today.month
    # 将标题转换为 slug，用于文件名
    file_slug = slugify(title)
    file_name = f"{today.isoformat()}-{file_slug}.mdx"

    # 4. 创建目录
    # 格式为 'data/blog/年/月'
    blog_dir = os.path.join("data", "blog", str(year), f"{month:02d}")
    os.makedirs(blog_dir, exist_ok=True)

    # 5. 生成文件内容
    # 确保日期格式正确
    date_str = today.isoformat()
    # 格式化标签列表为 JSON 字符串
    tags_str = ', '.join([f'"{t}"' for t in tags])

    content = f"""---
title: "{title}"
date: "{date_str}"
tags: [{tags_str}]
lastmod: "{date_str}"
draft: false
summary: 
---
**{title}**

在这里开始你的文章内容...
"""

    # 6. 写入文件
    file_path = os.path.join(blog_dir, file_name)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print("\n----------------------")
    print("文件已成功创建！")
    print(f"路径: {file_path}")
    print("----------------------")

    # 7. 自动打开文件
    try:
        if os.name == 'nt':  # Windows
            # 使用 start 命令打开文件，可以在新的应用中打开
            os.startfile(file_path)
        elif os.name == 'posix':  # macOS 或 Linux
            if 'darwin' in sys.platform:  # macOS
                subprocess.Popen(['open', file_path])
            else:  # Linux
                subprocess.Popen(['xdg-open', file_path])
        print("文件已自动打开。")
    except FileNotFoundError:
        print(f"无法自动打开文件。请手动打开: {file_path}")
    except Exception as e:
        print(f"自动打开文件时出错: {e}")

if __name__ == "__main__":
    create_blog_post()
