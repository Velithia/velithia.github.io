---
title: KMP算法动画模拟
date: 2025-02-11 06:42:28
tags:
---
欢迎访问：[KMP动画模拟](/animations/kmp.html)

KMP示例代码：
```cpp
#include <iostream>
#include <vector>
#include <string>

// 构造部分匹配表（前缀表）
std::vector<int> buildPartialMatchTable(const std::string &pattern) {
    int m = pattern.size();
    std::vector<int> lps(m, 0); // lps[i] 表示长度为 i+1 的子串的最长相等前后缀长度
    int len = 0;               // 当前最长相等前后缀的长度
    int i = 1;                 // 从第二个字符开始

    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1]; // 回退到之前的最长前后缀长度
            } else {
                lps[i] = 0; // 没有匹配的前后缀
                i++;
            }
        }
    }
    return lps;
}

// KMP 字符串匹配算法
std::vector<int> KMP_Search(const std::string &text, const std::string &pattern) {
    std::vector<int> result;           // 存储匹配的起始索引位置
    std::vector<int> lps = buildPartialMatchTable(pattern);
    int n = text.size();
    int m = pattern.size();
    int i = 0;                         // text 的索引
    int j = 0;                         // pattern 的索引

    while (i < n) {
        if (text[i] == pattern[j]) {
            i++;
            j++;
        }
        if (j == m) {                  // 完全匹配
            result.push_back(i - j);   // 记录匹配起始位置
            j = lps[j - 1];           // 寻找下一个匹配
        } else if (i < n && text[i] != pattern[j]) {
            if (j != 0) {
                j = lps[j - 1];       // 利用部分匹配表跳过不必要的比较
            } else {
                i++;
            }
        }
    }
    return result;
}

// 测试函数
int main() {
    std::string text = "ababcabcabababd";
    std::string pattern = "ababd";

    std::vector<int> matches = KMP_Search(text, pattern);

    std::cout << "Pattern found at indices: ";
    for (int index : matches) {
        std::cout << index << " ";
    }
    std::cout << std::endl;

    return 0;
}
```