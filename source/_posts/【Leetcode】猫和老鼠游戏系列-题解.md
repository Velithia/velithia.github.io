---
title: 【Leetcode】猫和老鼠游戏系列 题解
date: 2025-02-10 23:27:58
tags: [leetcode, 题解, 代码]
---
# 猫和老鼠 I和II 题解
## 猫和老鼠 题解
猫和老鼠是LeetCode上的一道博弈论问题。话不多说直接上链接：https://leetcode.cn/problems/cat-and-mouse/description/

第一次写Markdown，有点不熟练，大家多多包涵~

### 题意解析
要做出这道题目，首先当然需要先看懂题目啦……

有童鞋反馈连题目都没看懂，那我来解释一下：
猫最初在2位置，鼠鼠最初在1位置，游戏规则是：
1. 鼠鼠先走，然后猫再走，轮流进行。
2. 每次移动可以跳到任意一个相邻的位置。
3. 如果鼠鼠到达0这个位置（安全屋），则鼠鼠获胜。
4. 如果猫到达鼠鼠的位置，则猫获胜。
5. 如果鼠鼠和猫一直移动都不能分出胜负，则认为是平局。
6. 输出结果为：1表示鼠鼠获胜；2表示猫获胜；0表示平局。

graph给的是与当前位置连通的位置，例如第一个样例graph = [[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]]

意思是，与0连通的是2和5，与1连通的是3，以此类推……

建议配合样例1的图食用：
![样例1的图](/images/cat1.jpg)

### 解题思路
首先，我们定义dp数组，dp[m][c][t]表示鼠鼠在m，猫在c，轮到t（0-鼠，1-猫）时的结果。结果分为**鼠鼠赢、猫赢和平局**（具体值按照题目定义设置）。

也就是：

```cpp
const int MOUSE_WIN = 1, CAT_WIN = 2, DRAW = 0;
```

接下来考虑边界情况：如果鼠鼠到达0这个位置，则鼠鼠获胜；如果猫到达鼠鼠的位置，则猫获胜。把这两种位置的dp值分别设为**MOUSE_WIN**和**CAT_WIN**，还要把这两种获胜的状态加入队列中。

```cpp
// 初始化边界条件：鼠鼠直达安全屋，鼠赢
for (int c = 0; c < n; c++) {
    for (int t = 0; t < 2; t++) {
        if (dp[0][c][t] == DRAW) {
            dp[0][c][t] = MOUSE_WIN;
            q.emplace_back(0, c, t, MOUSE_WIN); // 加入队列
        }
    }
}
// 初始化边界条件：猫鼠相遇（猫不能进入安全屋），猫赢
for (int m = 1; m < n; m++) {
    for (int t = 0; t < 2; t++) {
        if (dp[m][m][t] == DRAW) {
            dp[m][m][t] = CAT_WIN;
            q.emplace_back(m, m, t, CAT_WIN);
        }
    }
}
```

加入队列中，就可以考虑进行BFS了。每次循环，我们从队列中取出一个状态，然后考虑其父状态。假设取出状态的轮次为t，则其父状态的轮次为1-t（或者t^1，结果一样）。

我们假设父状态是0（说明父状态是鼠鼠走的）。如果取出的状态是鼠鼠赢，那么父状态也应该是鼠鼠赢，因为鼠鼠必然可以通过这种走法躲进安全屋使得自己赢得游戏（鼠鼠既然能躲进安全屋为什么要跑去其它地方呢？）；

如果取出的状态是猫赢，那么当前结果不一定是猫赢，因为可能存在其它路径可以使鼠鼠逃脱猫的捕捉（但这条路径肯定不行！）。在这种情况下，我们只能将父状态中鼠鼠可以用来逃脱的路径数量减去1。如果这个值变成0了，就说明**无论怎么走，鼠鼠都逃不出猫的手掌心**，那么父状态就是猫赢。

队列中没有平局的状态，因此我们不需要考虑这种情况。

父状态是1的情况完全是对称的，这里不多说了。BFS完成后，dp[1][2][0]就是最终结果。

### 解决代码
时间复杂度O(N^3)，空间复杂度O(N^2)，证明略。
```cpp
class Solution {
public:
    int catMouseGame(vector<vector<int>>& graph) {
        int n = graph.size();
        const int MOUSE_WIN = 1, CAT_WIN = 2, DRAW = 0;
        // dp[m][c][t] 表示鼠鼠在m，猫在c，轮到t（0-鼠，1-猫）时的结果
        vector<vector<vector<int>>> dp(n, vector<vector<int>>(n, vector<int>(2, DRAW)));
        // degree[m][c][t] 表示该状态下可能的移动次数（度数）
        vector<vector<vector<int>>> degree(n, vector<vector<int>>(n, vector<int>(2, 0)));
        
        // 初始化度数
        for (int m = 0; m < n; m++) {
            for (int c = 0; c < n; c++) {
                // 鼠鼠的回合，可移动次数是邻接节点数
                degree[m][c][0] = graph[m].size();
                // 猫的回合，可移动次数是邻接节点中非0的数目
                int cnt = 0;
                for (int nei : graph[c]) {
                    if (nei != 0) cnt++;
                }
                degree[m][c][1] = cnt;
            }
        }
        
        deque<tuple<int, int, int, int>> q;
        // 初始化边界条件：鼠鼠直达安全屋，鼠赢
        for (int c = 0; c < n; c++) {
            for (int t = 0; t < 2; t++) {
                dp[0][c][t] = MOUSE_WIN;
                q.emplace_back(0, c, t, MOUSE_WIN);
            }
        }
        // 初始化边界条件：猫鼠相遇（猫不能进入安全屋），猫赢
        for (int m = 1; m < n; m++) { // 一定不要漏考虑！
            for (int t = 0; t < 2; t++) {
                dp[m][m][t] = CAT_WIN;
                q.emplace_back(m, m, t, CAT_WIN);
            }
        }
        
        while (!q.empty()) {
            auto [m, c, t, result] = q.front();
            q.pop_front();
            
            int prevTurn = 1 - t; // 父状态的轮次
            if (prevTurn == 0) { // 父状态是鼠鼠的回合（当前状态是猫移动后的结果）
                // 遍历所有可能的鼠鼠移动前的位置（prevMouse）
                for (int prevMouse : graph[m]) {
                    if (dp[prevMouse][c][0] != DRAW) continue; // 已处理过
                    // 如果当前结果鼠鼠赢，说明父状态的鼠鼠可以移动到这里赢，故父状态也赢
                    if (result == MOUSE_WIN) {
                        dp[prevMouse][c][0] = MOUSE_WIN;
                        q.emplace_back(prevMouse, c, 0, MOUSE_WIN);
                    } else {
                        // 当前结果对鼠鼠不利，父状态度数减一
                        degree[prevMouse][c][0]--;
                        if (degree[prevMouse][c][0] == 0) { // 所有移动都导致猫赢
                            dp[prevMouse][c][0] = CAT_WIN;
                            q.emplace_back(prevMouse, c, 0, CAT_WIN);
                        }
                    }
                }
            } else { // 父状态是猫的回合（当前状态是鼠鼠移动后的结果）
                // 遍历所有可能的猫移动前的位置（prevCat）
                for (int prevCat : graph[c]) {
                    if (prevCat == 0) continue; // 猫不能移动到0
                    if (dp[m][prevCat][1] != DRAW) continue; // 已处理过
                    // 如果当前结果猫赢，父状态的猫移动到这里赢
                    if (result == CAT_WIN) {
                        dp[m][prevCat][1] = CAT_WIN;
                        q.emplace_back(m, prevCat, 1, CAT_WIN);
                    } else {
                        // 当前结果对猫不利，父状态度数减一
                        degree[m][prevCat][1]--;
                        if (degree[m][prevCat][1] == 0) { // 所有移动都导致鼠鼠赢
                            dp[m][prevCat][1] = MOUSE_WIN;
                            q.emplace_back(m, prevCat, 1, MOUSE_WIN);
                        }
                    }
                }
            }
        }
        
        return dp[1][2][0]; // 初始状态：鼠鼠在1，猫在2，鼠鼠先手
    }
};
```

## 猫和老鼠 II 题解
有点长，待会再写。